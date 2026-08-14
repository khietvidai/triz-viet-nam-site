import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

/**
 * Xác thực cho khu vực video đào tạo nội bộ.
 * - Mật khẩu băm bằng PBKDF2 (Web Crypto, chạy được trên Workers).
 * - Phiên đăng nhập là token ký HMAC-SHA256, lưu trong cookie HttpOnly.
 */

export type NoiboEnv = {
    DB?: D1Database;
    VIDEOS?: R2Bucket;
    SESSION_SECRET?: string;
    ADMIN_SECRET?: string;
};

export type VideoUser = {
    id: number;
    email: string;
    approved: number;
};

export const SESSION_COOKIE = 'noibo_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 ngày
const PBKDF2_ITERATIONS = 100_000;

const encoder = new TextEncoder();

export function getNoiboEnv(locals: unknown): NoiboEnv {
    const env = (locals as any)?.runtime?.env ?? {};
    return {
        DB: env.DB,
        VIDEOS: env.VIDEOS,
        SESSION_SECRET: env.SESSION_SECRET ?? import.meta.env.SESSION_SECRET,
        ADMIN_SECRET: env.ADMIN_SECRET ?? import.meta.env.ADMIN_SECRET,
    };
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

/** So sánh chuỗi hex không lộ thời gian (timing-safe). */
function timingSafeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export async function hashPassword(
    password: string,
    existingSaltHex?: string
): Promise<{ hash: string; salt: string }> {
    const salt = existingSaltHex
        ? hexToBytes(existingSaltHex)
        : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        256
    );
    return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

export async function verifyPassword(
    password: string,
    saltHex: string,
    expectedHash: string
): Promise<boolean> {
    const { hash } = await hashPassword(password, saltHex);
    return timingSafeEqualHex(hash, expectedHash);
}

async function hmacHex(secret: string, message: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return bytesToHex(new Uint8Array(sig));
}

/** Tạo token phiên: base64(email).exp.hmac */
export async function createSessionToken(secret: string, email: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const emailB64 = btoa(unescape(encodeURIComponent(email)));
    const sig = await hmacHex(secret, `${emailB64}.${exp}`);
    return `${emailB64}.${exp}.${sig}`;
}

/** Trả về email nếu token hợp lệ và còn hạn, ngược lại null. */
export async function verifySessionToken(
    secret: string,
    token: string | undefined
): Promise<string | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [emailB64, expStr, sig] = parts;
    const exp = parseInt(expStr, 10);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    const expected = await hmacHex(secret, `${emailB64}.${exp}`);
    if (!timingSafeEqualHex(expected, sig)) return null;
    try {
        return decodeURIComponent(escape(atob(emailB64)));
    } catch {
        return null;
    }
}

/** Lấy user đã đăng nhập từ cookie; null nếu chưa đăng nhập/hết hạn. */
export async function getSessionUser(
    env: NoiboEnv,
    cookieValue: string | undefined
): Promise<VideoUser | null> {
    if (!env.SESSION_SECRET || !env.DB) return null;
    const email = await verifySessionToken(env.SESSION_SECRET, cookieValue);
    if (!email) return null;
    const row = await env.DB.prepare(
        'SELECT id, email, approved FROM video_users WHERE email = ?'
    )
        .bind(email)
        .first<VideoUser>();
    return row ?? null;
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
