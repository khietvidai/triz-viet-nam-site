import type { APIRoute } from 'astro';
import { getNoiboEnv } from '@/lib/videoAuth';

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

    if (!GOOGLE_CLIENT_ID) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Google OAuth is not configured on the server. Missing GOOGLE_CLIENT_ID.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const state = crypto.randomUUID();
    cookies.set('oauth_state', state, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600,
    });

    const redirectParam = new URL(request.url).searchParams.get('redirect');
    const safeRedirect = sanitizeRedirectPath(redirectParam, '/vi/noi-bo');
    cookies.set('auth_redirect', safeRedirect, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600,
    });

    const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'openid profile email',
            state: state,
            prompt: 'select_account',
        }).toString();

    return Response.redirect(googleAuthUrl, 302);
};
