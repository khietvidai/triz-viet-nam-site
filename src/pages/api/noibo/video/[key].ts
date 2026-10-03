import type { APIRoute } from 'astro';
import { getNoiboEnv, getSessionUser, isUserAdmin, SESSION_COOKIE } from '@/lib/videoAuth';
import videoManifest from '@/Data/noibo_videos.json';

export const prerender = false;

const ALLOWED_KEYS = new Set(videoManifest.map((v) => v.key));
// Các clip được xem tự do (công khai / miễn phí không cần duyệt)
const FREE_KEYS = new Set(
    videoManifest
        .filter((v: any) => v.isFree || v.isPublic)
        .map((v) => v.key)
);

/**
 * Stream video từ R2 bucket:
 * - 2 clip đầu tiên: xem tự do không cần đăng nhập.
 * - Các clip còn lại: yêu cầu tài khoản đã đăng nhập và được duyệt (hoặc là Admin).
 * Hỗ trợ HTTP Range để trình phát video tua được.
 */
export const GET: APIRoute = async ({ params, request, locals, cookies }) => {
    const env = getNoiboEnv(locals);
    if (!env.VIDEOS) {
        return new Response('Service unavailable', { status: 503 });
    }
    const key = params.key ?? '';
    if (!ALLOWED_KEYS.has(key)) return new Response('Not found', { status: 404 });

    // Kiểm tra quyền xem: nếu không thuộc danh sách công khai/miễn phí thì phải đăng nhập và được duyệt (hoặc là Admin)
    if (!FREE_KEYS.has(key)) {
        const sessionToken = cookies.get(SESSION_COOKIE)?.value;
        const user = await getSessionUser(env, sessionToken);
        if (!user) {
            return new Response('Unauthorized: Vui lòng đăng nhập để xem video này', { status: 401 });
        }
        if (!isUserAdmin(user.email) && !user.approved) {
            return new Response(
                'Forbidden: Tài khoản của bạn đang chờ duyệt. Vui lòng liên hệ email trizungdung2023@gmail.com để được kích hoạt xem full video.',
                { status: 403 }
            );
        }
    }

    try {
        const rangeHeader = request.headers.get('Range');
        const baseHeaders: Record<string, string> = {
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'private, no-store',
        };

        if (rangeHeader) {
            const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
            if (!match || (match[1] === '' && match[2] === '')) {
                return new Response('Invalid range', { status: 416 });
            }

            // Cần kích thước tổng để tính Content-Range
            const head = await env.VIDEOS.head(key);
            if (!head) return new Response('Not found', { status: 404 });
            const size = head.size;

            let start: number;
            let end: number;
            if (match[1] === '') {
                // bytes=-N : N byte cuối
                const suffix = Math.min(parseInt(match[2], 10), size);
                start = size - suffix;
                end = size - 1;
            } else {
                start = parseInt(match[1], 10);
                end = match[2] === '' ? size - 1 : Math.min(parseInt(match[2], 10), size - 1);
            }
            if (start >= size || start > end) {
                return new Response('Range not satisfiable', {
                    status: 416,
                    headers: { 'Content-Range': `bytes */${size}` },
                });
            }

            const object = await env.VIDEOS.get(key, {
                range: { offset: start, length: end - start + 1 },
            });
            if (!object) return new Response('Not found', { status: 404 });

            return new Response(object.body as unknown as BodyInit, {
                status: 206,
                headers: {
                    ...baseHeaders,
                    'Content-Range': `bytes ${start}-${end}/${size}`,
                    'Content-Length': String(end - start + 1),
                },
            });
        }

        const object = await env.VIDEOS.get(key);
        if (!object) return new Response('Not found', { status: 404 });

        return new Response(object.body as unknown as BodyInit, {
            status: 200,
            headers: { ...baseHeaders, 'Content-Length': String(object.size) },
        });
    } catch (error) {
        console.error('Video stream error:', error);
        return new Response('Internal error', { status: 500 });
    }
};
