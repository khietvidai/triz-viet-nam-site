import type { APIRoute } from 'astro';
import { getNoiboEnv } from '@/lib/videoAuth';

export const prerender = false;

/**
 * Trang quản trị tối giản: duyệt/thu hồi quyền xem video.
 * Truy cập: /api/noibo/admin?key=<ADMIN_SECRET>
 * Duyệt:    ...&approve=<email>   Thu hồi: ...&revoke=<email>
 */
export const GET: APIRoute = async ({ url, locals }) => {
    const env = getNoiboEnv(locals);
    if (!env.DB || !env.ADMIN_SECRET) {
        return new Response('Service unavailable', { status: 503 });
    }

    const key = url.searchParams.get('key') ?? '';
    if (key !== env.ADMIN_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const approve = url.searchParams.get('approve');
        const revoke = url.searchParams.get('revoke');
        if (approve) {
            await env.DB.prepare('UPDATE video_users SET approved = 1 WHERE email = ?')
                .bind(approve.toLowerCase())
                .run();
        }
        if (revoke) {
            await env.DB.prepare('UPDATE video_users SET approved = 0 WHERE email = ?')
                .bind(revoke.toLowerCase())
                .run();
        }

        const { results } = await env.DB.prepare(
            'SELECT email, approved, created_at FROM video_users ORDER BY created_at DESC'
        ).all<{ email: string; approved: number; created_at: string }>();

        const esc = (s: string) =>
            s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const adminKey = encodeURIComponent(key);

        const rows = (results ?? [])
            .map((u) => {
                const email = esc(u.email);
                const emailParam = encodeURIComponent(u.email);
                const action = u.approved
                    ? `<a href="?key=${adminKey}&revoke=${emailParam}">Thu hồi</a>`
                    : `<a href="?key=${adminKey}&approve=${emailParam}">Duyệt</a>`;
                return `<tr><td>${email}</td><td>${u.approved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}</td><td>${esc(u.created_at)}</td><td>${action}</td></tr>`;
            })
            .join('');

        const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<title>Duyệt người xem video nội bộ</title>
<style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 16px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5}a{color:#6d28d9}</style></head><body>
<h1>Người dùng video nội bộ</h1>
<table><tr><th>Email</th><th>Trạng thái</th><th>Đăng ký lúc</th><th>Hành động</th></tr>${rows || '<tr><td colspan="4">Chưa có ai đăng ký</td></tr>'}</table>
</body></html>`;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
        });
    } catch (error) {
        console.error('Admin page error:', error);
        return new Response('Internal error', { status: 500 });
    }
};
