import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@/lib/videoAuth';

export const prerender = false;

export const POST: APIRoute = async ({ redirect, cookies }) => {
    cookies.delete(SESSION_COOKIE, { path: '/' });
    return redirect('/vi/noi-bo', 303);
};
