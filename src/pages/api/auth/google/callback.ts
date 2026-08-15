import type { APIRoute } from 'astro';
import {
    createSessionToken,
    getNoiboEnv,
    SESSION_COOKIE,
} from '@/lib/videoAuth';

export const prerender = false;

function sanitizeRedirectPath(path: string | null | undefined, fallback: string): string {
    if (!path || !path.startsWith('/') || path.startsWith('//')) {
        return fallback;
    }
    return path;
}

export const GET: APIRoute = async ({ request, locals, cookies }) => {
    const env = getNoiboEnv(locals);
    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID || '';
    const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || '';
    const SESSION_SECRET = env.SESSION_SECRET || '';
    const db = env.DB;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return new Response(
            JSON.stringify({ success: false, error: 'Google OAuth is not configured on the server.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    if (!SESSION_SECRET || !db) {
        return new Response(
            JSON.stringify({ success: false, error: 'Server database or session secret is not configured.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const savedState = cookies.get('oauth_state')?.value;

    if (!state || !savedState || state !== savedState) {
        return new Response(
            JSON.stringify({ success: false, error: 'CSRF state verification failed.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    cookies.delete('oauth_state', { path: '/' });

    if (!code) {
        return new Response(
            JSON.stringify({ success: false, error: 'Missing authorization code.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const origin = url.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenRes.ok) {
            throw new Error(`Google token exchange returned ${tokenRes.status}: ${await tokenRes.text()}`);
        }

        const tokenData: any = await tokenRes.json();
        const accessToken = tokenData.access_token;

        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userinfoRes.ok) {
            throw new Error(`Google userinfo returned ${userinfoRes.status}`);
        }

        const userinfo: any = await userinfoRes.json();
        const { sub: googleId, email, name, picture: avatarUrl } = userinfo;

        if (!email) {
            throw new Error('No email returned by Google OAuth');
        }

        const lowerEmail = email.trim().toLowerCase();

        // 1. Kiểm tra theo google_id hoặc email
        const existingUser = await db
            .prepare('SELECT id, email, approved, google_id FROM video_users WHERE google_id = ? OR email = ?')
            .bind(googleId, lowerEmail)
            .first<{ id: number; email: string; approved: number; google_id: string | null }>();

        if (existingUser) {
            // Cập nhật google_id, name, avatar_url nếu cần
            await db
                .prepare('UPDATE video_users SET google_id = ?, name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?')
                .bind(googleId, name ?? null, avatarUrl ?? null, existingUser.id)
                .run();
        } else {
            // Tạo mới người dùng (approved = 0: chờ Admin duyệt)
            await db
                .prepare('INSERT INTO video_users (email, password_hash, salt, google_id, name, avatar_url, approved) VALUES (?, ?, ?, ?, ?, ?, 0)')
                .bind(lowerEmail, '', '', googleId, name ?? null, avatarUrl ?? null)
                .run();
        }

        // Tạo token phiên và lưu cookie
        const token = await createSessionToken(SESSION_SECRET, lowerEmail);
        cookies.set(SESSION_COOKIE, token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        const redirectUrl = sanitizeRedirectPath(
            cookies.get('auth_redirect')?.value,
            '/vi/noi-bo'
        );
        try {
            cookies.delete('auth_redirect', { path: '/' });
        } catch (_) {}

        return Response.redirect(`${origin}${redirectUrl}`, 302);
    } catch (err: any) {
        console.error('Google OAuth callback error:', err);
        return new Response(
            JSON.stringify({ success: false, error: err.message || 'OAuth error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
