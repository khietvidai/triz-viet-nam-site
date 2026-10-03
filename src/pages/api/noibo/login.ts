import type { APIRoute } from 'astro';
import {
    createSessionToken,
    getNoiboEnv,
    SESSION_COOKIE,
    verifyPassword,
} from '@/lib/videoAuth';

export const prerender = false;

const DEFAULT_REDIRECT = '/vi/noi-bo';

/** Đăng nhập khu vực video nội bộ bằng tài khoản/email và mật khẩu. */
export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
    let safeRedirect = DEFAULT_REDIRECT;
    try {
        const env = getNoiboEnv(locals);
        if (!env.DB || !env.SESSION_SECRET) {
            console.error('Login unavailable: missing DB binding or SESSION_SECRET.');
            return redirect(`${DEFAULT_REDIRECT}?err=server#login-box`, 303);
        }

        const form = await request.formData();
        const account = String(
            form.get('account') ?? form.get('email') ?? form.get('username') ?? ''
        ).trim().toLowerCase();
        const password = String(form.get('password') ?? '');
        const redirectParam = String(form.get('redirect') ?? DEFAULT_REDIRECT).trim();

        // Đảm bảo URL chuyển hướng là đường dẫn tương đối an toàn
        if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
            safeRedirect = redirectParam;
        }

        if (!account || !password) {
            const sep = safeRedirect.includes('?') ? '&' : '?';
            return redirect(`${safeRedirect}${sep}err=missing#login-box`, 303);
        }

        // Tìm người dùng theo email, username, hoặc email dạng account@trizvietnam.com
        let user: { id: number; email: string; password_hash: string; salt: string } | null = null;
        try {
            user = await env.DB.prepare(
                `SELECT id, email, password_hash, salt 
                 FROM video_users 
                 WHERE LOWER(email) = ? OR LOWER(email) = ? OR (username IS NOT NULL AND LOWER(username) = ?)`
            )
                .bind(account, `${account}@trizvietnam.com`, account)
                .first<{ id: number; email: string; password_hash: string; salt: string }>();
        } catch {
            // Fallback nếu cơ sở dữ liệu chưa có cột username
            user = await env.DB.prepare(
                `SELECT id, email, password_hash, salt 
                 FROM video_users 
                 WHERE LOWER(email) = ? OR LOWER(email) = ?`
            )
                .bind(account, `${account}@trizvietnam.com`)
                .first<{ id: number; email: string; password_hash: string; salt: string }>();
        }

        const valid =
            Boolean(user && (await verifyPassword(password, user.salt, user.password_hash)));

        if (!valid || !user) {
            const sep = safeRedirect.includes('?') ? '&' : '?';
            return redirect(`${safeRedirect}${sep}err=login#login-box`, 303);
        }

        const token = await createSessionToken(env.SESSION_SECRET, user.email);
        cookies.set(SESSION_COOKIE, token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        return redirect(safeRedirect, 303);
    } catch (error) {
        console.error('Login error:', error);
        const sep = safeRedirect.includes('?') ? '&' : '?';
        return redirect(`${safeRedirect}${sep}err=server#login-box`, 303);
    }
};
