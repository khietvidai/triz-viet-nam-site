import type { APIRoute } from 'astro';
import {
    createSessionToken,
    getNoiboEnv,
    SESSION_COOKIE,
    verifyPassword,
} from '@/lib/videoAuth';

export const prerender = false;

const BACK = '/vi/noi-bo';

/** Đăng nhập khu vực video nội bộ, đặt cookie phiên HttpOnly 7 ngày. */
export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
    try {
        const env = getNoiboEnv(locals);
        if (!env.DB || !env.SESSION_SECRET) {
            console.error('Login unavailable: missing DB binding or SESSION_SECRET.');
            return redirect(`${BACK}?err=server`, 303);
        }

        const form = await request.formData();
        const email = String(form.get('email') ?? '').trim().toLowerCase();
        const password = String(form.get('password') ?? '');

        const user = await env.DB.prepare(
            'SELECT id, email, password_hash, salt FROM video_users WHERE email = ?'
        )
            .bind(email)
            .first<{ id: number; email: string; password_hash: string; salt: string }>();

        const valid =
            user && (await verifyPassword(password, user.salt, user.password_hash));
        if (!valid) return redirect(`${BACK}?err=login`, 303);

        const token = await createSessionToken(env.SESSION_SECRET, user.email);
        cookies.set(SESSION_COOKIE, token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        return redirect(BACK, 303);
    } catch (error) {
        console.error('Login error:', error);
        return redirect(`${BACK}?err=server`, 303);
    }
};
