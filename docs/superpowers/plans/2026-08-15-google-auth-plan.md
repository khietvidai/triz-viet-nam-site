# Google OAuth Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Google OAuth 2.0 (Gmail sign-in and registration) for the TRIZ Vietnam member video training area (`/[lang]/noi-bo`), allowing users to register/sign-in with Google while maintaining administrator manual approval and session integrity.

**Architecture:** Cloudflare Workers-native OAuth 2.0 flow using Web Crypto HMAC sessions (`noibo_session` cookie). When user clicks Google sign-in, `/api/auth/google/login` redirects to Google Accounts with a CSRF state cookie; on callback `/api/auth/google/callback` exchanges the code for tokens, retrieves user profile (email, name, picture, sub), creates/updates `video_users` in Cloudflare D1 with `approved = 0` (pending), and issues a signed session cookie.

**Tech Stack:** Astro 5, Cloudflare Workers / D1, TypeScript, Web Crypto API, TailwindCSS 4.

## Global Constraints

- Platform: Cloudflare Pages / Workers SSR adapter (`output: 'server'` with Cloudflare adapter).
- Database: Cloudflare D1 (`triz-ai-history`, binding: `DB`).
- Cryptography: Web Crypto API (`crypto.subtle`) for PBKDF2 and HMAC-SHA256 (no Node.js crypto dependencies).
- Authentication Cookie: `noibo_session` (HttpOnly, Secure, SameSite=Lax, TTL 7 days).
- Approval Policy: New Google users default to `approved = 0` until approved by admin via `/api/noibo/admin?key=<ADMIN_SECRET>`.

---

### Task 1: D1 Migration & TypeScript Types for VideoUser

**Files:**
- Create: `migrations/0003_add_google_oauth_to_video_users.sql`
- Modify: `src/lib/videoAuth.ts`
- Test: `test_video_auth.ts`

**Interfaces:**
- Consumes: Cloudflare D1 `video_users` table structure from `migrations/0002_video_users.sql`.
- Produces:
  ```ts
  export type VideoUser = {
      id: number;
      email: string;
      approved: number;
      name?: string | null;
      avatar_url?: string | null;
      google_id?: string | null;
  };
  export function getNoiboEnv(locals: unknown): NoiboEnv;
  export function getSessionUser(env: NoiboEnv, cookieValue: string | undefined): Promise<VideoUser | null>;
  ```

- [ ] **Step 1: Write test for videoAuth session & user retrieval**

Create `test_video_auth.ts`:
```ts
import { createSessionToken, verifySessionToken } from "./src/lib/videoAuth.js";

async function run() {
    const secret = "test-secret-key-12345678901234567890";
    const email = "test@example.com";
    const token = await createSessionToken(secret, email);
    const verifiedEmail = await verifySessionToken(secret, token);
    if (verifiedEmail !== email) {
        throw new Error(`Expected ${email}, got ${verifiedEmail}`);
    }
    console.log("Session token verification: PASS");
}
run();
```

- [ ] **Step 2: Create D1 Migration for Google OAuth fields**

Create `migrations/0003_add_google_oauth_to_video_users.sql`:
```sql
-- Thêm các trường lưu thông tin Google OAuth vào video_users
ALTER TABLE video_users ADD COLUMN google_id TEXT;
ALTER TABLE video_users ADD COLUMN name TEXT;
ALTER TABLE video_users ADD COLUMN avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_video_users_google_id ON video_users (google_id);
```

- [ ] **Step 3: Update `src/lib/videoAuth.ts`**

Update `VideoUser` type, `NoiboEnv` type, and `getSessionUser`:
```ts
export type NoiboEnv = {
    DB?: D1Database;
    VIDEOS?: R2Bucket;
    SESSION_SECRET?: string;
    ADMIN_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
};

export type VideoUser = {
    id: number;
    email: string;
    approved: number;
    name?: string | null;
    avatar_url?: string | null;
    google_id?: string | null;
};
```
And in `getSessionUser`:
```ts
export async function getSessionUser(
    env: NoiboEnv,
    cookieValue: string | undefined
): Promise<VideoUser | null> {
    if (!env.SESSION_SECRET || !env.DB) return null;
    const email = await verifySessionToken(env.SESSION_SECRET, cookieValue);
    if (!email) return null;
    const row = await env.DB.prepare(
        'SELECT id, email, approved, name, avatar_url, google_id FROM video_users WHERE email = ?'
    )
        .bind(email)
        .first<VideoUser>();
    return row ?? null;
}
```

- [ ] **Step 4: Run test to verify session logic**

Run: `npx tsx test_video_auth.ts`
Expected: `Session token verification: PASS`

- [ ] **Step 5: Commit**

```bash
git add migrations/0003_add_google_oauth_to_video_users.sql src/lib/videoAuth.ts test_video_auth.ts
git commit -m "feat(auth): thêm migration và cập nhật VideoUser model cho Google OAuth"
```

---

### Task 2: Google OAuth Endpoints (`/api/auth/google/login` & `/api/auth/google/callback`)

**Files:**
- Create: `src/pages/api/auth/google/login.ts`
- Create: `src/pages/api/auth/google/callback.ts`
- Test: `test_google_oauth_logic.ts`

**Interfaces:**
- Consumes: `getNoiboEnv`, `createSessionToken`, `SESSION_COOKIE` from `src/lib/videoAuth.ts`.
- Produces:
  - `GET /api/auth/google/login`: Initiates OAuth 2.0 dance with Google.
  - `GET /api/auth/google/callback`: Handles OAuth 2.0 callback, user sync, and session issuance.

- [ ] **Step 1: Write test simulating CSRF validation and OAuth URL construction**

Create `test_google_oauth_logic.ts`:
```ts
function buildGoogleAuthUrl(clientId: string, redirectUri: string, state: string): string {
    return (
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid profile email",
            state: state,
            prompt: "select_account",
        }).toString()
    );
}

const url = buildGoogleAuthUrl("test-client-id", "http://localhost:4321/api/auth/google/callback", "uuid-1234");
if (!url.includes("client_id=test-client-id") || !url.includes("state=uuid-1234")) {
    throw new Error("Invalid Google Auth URL generation");
}
console.log("OAuth URL building test: PASS");
```

- [ ] **Step 2: Implement `src/pages/api/auth/google/login.ts`**

```ts
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
```

- [ ] **Step 3: Implement `src/pages/api/auth/google/callback.ts`**

```ts
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
```

- [ ] **Step 4: Run OAuth logic test**

Run: `npx tsx test_google_oauth_logic.ts`
Expected: `OAuth URL building test: PASS`

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/auth/google/login.ts src/pages/api/auth/google/callback.ts test_google_oauth_logic.ts
git commit -m "feat(auth): thêm API route Google OAuth login và callback"
```

---

### Task 3: Update Member Videos Page UI & Admin Dashboard

**Files:**
- Modify: `src/pages/[lang]/noi-bo.astro`
- Modify: `src/pages/api/noibo/admin.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Google login endpoint `/api/auth/google/login`, `VideoUser` type from `videoAuth.ts`.
- Produces:
  - Polished Google Sign-in button & user profile display on `/vi/noi-bo` & `/en/noi-bo`.
  - Upgraded `/api/noibo/admin` interface showing avatars, names, and OAuth badges.

- [ ] **Step 1: Update `.env.example`**

Add Google OAuth environment variable keys:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

- [ ] **Step 2: Update `src/pages/[lang]/noi-bo.astro`**

- Add Google OAuth Sign-in button with SVG logo:
```astro
<div class="mb-8">
    <a
        href={`/api/auth/google/login?redirect=/${lang}/noi-bo`}
        class="flex items-center justify-center gap-3 w-full max-w-md mx-auto py-3 px-5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 shadow-sm font-semibold text-gray-700 transition-all hover:shadow-md hover:border-gray-400 group"
    >
        <svg viewBox="0 0 48 48" width="22" height="22" class="flex-shrink-0">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.75H24v9.03h12.75c-.53 2.87-2.14 5.3-4.57 6.92l7.13 5.53C43.46 36.21 46.5 30.73 46.5 24z"/>
            <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.13-5.53c-2.11 1.41-4.81 2.34-8.76 2.34-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span>{lang === "vi" ? "Đăng nhập nhanh bằng tài khoản Google" : "Sign in with Google Account"}</span>
    </a>
    <div class="flex items-center my-6 max-w-md mx-auto">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{lang === "vi" ? "hoặc bằng email" : "or with email"}</span>
        <div class="flex-grow border-t border-gray-300"></div>
    </div>
</div>
```
- Update pending / approved profile header with avatar and name:
```astro
<div class="flex items-center gap-3">
    {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.name || user.email} class="w-10 h-10 rounded-full border border-gray-200" referrerpolicy="no-referrer" />
    ) : (
        <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
            {(user.name || user.email).charAt(0).toUpperCase()}
        </div>
    )}
    <div class="text-left">
        {user.name && <div class="font-bold text-gray-900">{user.name}</div>}
        <div class="text-sm text-gray-500">{user.email}</div>
    </div>
</div>
```

- [ ] **Step 3: Update `src/pages/api/noibo/admin.ts`**

Update the SELECT query and table row generation in `admin.ts`:
```ts
const { results } = await env.DB.prepare(
    'SELECT email, name, avatar_url, google_id, approved, created_at FROM video_users ORDER BY created_at DESC'
).all<{ email: string; name: string | null; avatar_url: string | null; google_id: string | null; approved: number; created_at: string }>();

const rows = (results ?? [])
    .map((u) => {
        const email = esc(u.email);
        const name = u.name ? esc(u.name) : '-';
        const method = u.google_id ? '<span style="color:#2563eb;font-weight:600">Google</span>' : '<span>Mật khẩu</span>';
        const avatar = u.avatar_url ? `<img src="${esc(u.avatar_url)}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:6px" referrerpolicy="no-referrer" />` : '';
        const emailParam = encodeURIComponent(u.email);
        const action = u.approved
            ? `<a href="?key=${adminKey}&revoke=${emailParam}" style="color:#dc2626">Thu hồi</a>`
            : `<a href="?key=${adminKey}&approve=${emailParam}" style="color:#16a34a;font-weight:bold">Duyệt</a>`;
        return `<tr><td>${avatar}${email}</td><td>${name}</td><td>${method}</td><td>${u.approved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}</td><td>${esc(u.created_at)}</td><td>${action}</td></tr>`;
    })
    .join('');
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/[lang]/noi-bo.astro src/pages/api/noibo/admin.ts .env.example
git commit -m "feat(ui): nâng cấp giao diện đăng nhập Google và trang quản trị duyệt thành viên"
```

---

### Task 4: Full System Verification, Build & Typecheck

**Files:**
- Verification only

- [ ] **Step 1: Run TypeScript / Astro typecheck**

Run: `npx astro check`
Expected: 0 errors

- [ ] **Step 2: Run Production Build**

Run: `npm run build`
Expected: Build successfully completes with 0 errors and generates worker artifacts in `dist/`.

- [ ] **Step 3: Cleanup temporary test scripts**

```bash
rm -f test_video_auth.ts test_google_oauth_logic.ts
git add .
git commit -m "chore: hoàn thiện tích hợp Google OAuth cho TRIZ Vietnam"
```
