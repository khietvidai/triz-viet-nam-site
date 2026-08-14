import type { APIRoute } from 'astro';
import { getNoiboEnv, hashPassword, isValidEmail } from '@/lib/videoAuth';

export const prerender = false;

const BACK = '/vi/noi-bo';

/** Đăng ký tài khoản xem video nội bộ. Chờ admin duyệt mới xem được. */
export const POST: APIRoute = async ({ request, locals, redirect }) => {
    try {
        const env = getNoiboEnv(locals);
        if (!env.DB) return redirect(`${BACK}?err=server`, 303);

        const form = await request.formData();
        const email = String(form.get('email') ?? '').trim().toLowerCase();
        const password = String(form.get('password') ?? '');

        if (!isValidEmail(email)) return redirect(`${BACK}?err=email`, 303);
        if (password.length < 8) return redirect(`${BACK}?err=password`, 303);

        const existing = await env.DB.prepare(
            'SELECT id FROM video_users WHERE email = ?'
        )
            .bind(email)
            .first();
        if (existing) return redirect(`${BACK}?err=exists`, 303);

        const { hash, salt } = await hashPassword(password);
        await env.DB.prepare(
            'INSERT INTO video_users (email, password_hash, salt) VALUES (?, ?, ?)'
        )
            .bind(email, hash, salt)
            .run();

        return redirect(`${BACK}?ok=registered`, 303);
    } catch (error) {
        console.error('Register error:', error);
        return redirect(`${BACK}?err=server`, 303);
    }
};
