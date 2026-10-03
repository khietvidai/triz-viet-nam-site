import type { APIRoute } from 'astro';
import { getNoiboEnv } from '@/lib/videoAuth';
import videoManifest from '@/Data/noibo_videos.json';

export const prerender = false;

const ALLOWED_KEYS = new Set(videoManifest.map((v) => v.key));

export const ALL: APIRoute = async ({ request, url, locals }) => {
    const env = getNoiboEnv(locals);
    if (!env.VIDEOS || !env.ADMIN_SECRET) {
        return new Response(JSON.stringify({ error: 'Service unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const authKey = request.headers.get('x-admin-secret') || url.searchParams.get('key');
    if (authKey !== env.ADMIN_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const action = url.searchParams.get('action');

    try {
        if (action === 'list') {
            const list = await env.VIDEOS.list();
            return new Response(
                JSON.stringify({
                    objects: list.objects.map((o) => ({
                        key: o.key,
                        size: o.size,
                        uploaded: o.uploaded,
                    })),
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const fileKey = url.searchParams.get('fileKey');
        if (!fileKey || !ALLOWED_KEYS.has(fileKey)) {
            return new Response(
                JSON.stringify({ error: `Invalid or missing fileKey: ${fileKey}` }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        if (action === 'status') {
            const head = await env.VIDEOS.head(fileKey);
            if (!head) {
                return new Response(
                    JSON.stringify({ exists: false, key: fileKey }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
            return new Response(
                JSON.stringify({
                    exists: true,
                    key: head.key,
                    size: head.size,
                    uploaded: head.uploaded,
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        if (action === 'create') {
            const mp = await env.VIDEOS.createMultipartUpload(fileKey, {
                httpMetadata: { contentType: 'video/mp4' },
            });
            return new Response(
                JSON.stringify({ uploadId: mp.uploadId, key: mp.key }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        if (action === 'part') {
            const uploadId = url.searchParams.get('uploadId');
            const partNumber = parseInt(url.searchParams.get('partNumber') || '', 10);
            if (!uploadId || isNaN(partNumber) || partNumber < 1) {
                return new Response(
                    JSON.stringify({ error: 'Invalid part parameters' }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }

            const mp = env.VIDEOS.resumeMultipartUpload(fileKey, uploadId);
            const arrayBuffer = await request.arrayBuffer();
            const part = await mp.uploadPart(partNumber, arrayBuffer);
            return new Response(JSON.stringify(part), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (action === 'complete') {
            const uploadId = url.searchParams.get('uploadId');
            if (!uploadId) {
                return new Response(
                    JSON.stringify({ error: 'Missing uploadId' }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }

            const { parts } = (await request.json()) as {
                parts: Array<{ partNumber: number; etag: string }>;
            };
            const mp = env.VIDEOS.resumeMultipartUpload(fileKey, uploadId);
            const object = await mp.complete(parts);
            return new Response(
                JSON.stringify({
                    success: true,
                    key: object.key,
                    size: object.size,
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        if (action === 'abort') {
            const uploadId = url.searchParams.get('uploadId');
            if (uploadId) {
                const mp = env.VIDEOS.resumeMultipartUpload(fileKey, uploadId);
                await mp.abort();
            }
            return new Response(JSON.stringify({ aborted: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Multipart upload error:', err);
        return new Response(
            JSON.stringify({ error: err.message || 'Internal error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
