import type { APIRoute } from 'astro';
import {
    getNoiboEnv,
    getSessionUser,
    isUserAdmin,
    ADMIN_EMAILS,
    SESSION_COOKIE,
} from '@/lib/videoAuth';

export const prerender = false;

/**
 * API quản lý người dùng video nội bộ (chỉ dành cho Admin).
 * Admin được cấp quyền:
 * - trizungdung2023@gmail.com
 * - khietvidai@gmail.com
 */
export const GET: APIRoute = async ({ request, locals, cookies }) => {
    const env = getNoiboEnv(locals);
    if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const sessionToken = cookies.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(env, sessionToken);

    if (!user || !isUserAdmin(user.email)) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        let results;
        try {
            const res = await env.DB.prepare(
                'SELECT id, email, username, name, avatar_url, google_id, approved, created_at FROM video_users ORDER BY created_at DESC'
            ).all<{
                id: number;
                email: string;
                username?: string | null;
                name: string | null;
                avatar_url: string | null;
                google_id: string | null;
                approved: number;
                created_at: string;
            }>();
            results = res.results;
        } catch {
            const res = await env.DB.prepare(
                'SELECT id, email, name, avatar_url, google_id, approved, created_at FROM video_users ORDER BY created_at DESC'
            ).all<{
                id: number;
                email: string;
                username?: string | null;
                name: string | null;
                avatar_url: string | null;
                google_id: string | null;
                approved: number;
                created_at: string;
            }>();
            results = res.results;
        }

        const usersWithRoles = (results ?? []).map((u) => ({
            ...u,
            isAdmin: isUserAdmin(u.email),
        }));

        return new Response(JSON.stringify({ success: true, users: usersWithRoles }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    } catch (error: any) {
        console.error('API admin/users GET error:', error);
        return new Response(JSON.stringify({ error: error?.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
    const env = getNoiboEnv(locals);
    if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const sessionToken = cookies.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(env, sessionToken);

    if (!user || !isUserAdmin(user.email)) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const { action, email } = body as { action?: string; email?: string };

        if (!action || !email) {
            return new Response(JSON.stringify({ error: 'Missing action or email parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const targetEmail = email.trim().toLowerCase();
        const targetIsAdmin = isUserAdmin(targetEmail);

        if (action === 'approve') {
            await env.DB.prepare(
                'UPDATE video_users SET approved = 1 WHERE LOWER(email) = ? OR (username IS NOT NULL AND LOWER(username) = ?)'
            )
                .bind(targetEmail, targetEmail)
                .run();
            return new Response(
                JSON.stringify({ success: true, message: `Đã duyệt kích hoạt thành công cho ${targetEmail}` }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (action === 'revoke') {
            if (targetIsAdmin) {
                return new Response(
                    JSON.stringify({ error: 'Không thể thu hồi quyền của tài khoản Quản trị viên' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            await env.DB.prepare(
                'UPDATE video_users SET approved = 0 WHERE LOWER(email) = ? OR (username IS NOT NULL AND LOWER(username) = ?)'
            )
                .bind(targetEmail, targetEmail)
                .run();
            return new Response(
                JSON.stringify({ success: true, message: `Đã thu hồi quyền xem của ${targetEmail}` }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (action === 'delete') {
            if (targetIsAdmin) {
                return new Response(
                    JSON.stringify({ error: 'Không thể xóa tài khoản Quản trị viên' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            await env.DB.prepare(
                'DELETE FROM video_users WHERE LOWER(email) = ? OR (username IS NOT NULL AND LOWER(username) = ?)'
            )
                .bind(targetEmail, targetEmail)
                .run();
            return new Response(
                JSON.stringify({ success: true, message: `Đã xóa người dùng ${targetEmail}` }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify({ error: `Hành động không hợp lệ: ${action}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('API admin/users POST error:', error);
        return new Response(JSON.stringify({ error: error?.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
