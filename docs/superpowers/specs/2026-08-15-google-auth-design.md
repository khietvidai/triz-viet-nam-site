# Google OAuth Authentication Design Document

**Date:** 2026-08-15  
**Topic:** Google/Gmail Sign Up & Sign In for Member Videos Area  
**Status:** Approved  

---

## 1. Overview

TRIZ Vietnam provides a dedicated member video area (`/[lang]/noi-bo`) containing 7 lectures covering the 40 TRIZ Innovation Principles. Currently, authentication only supports manual email/password registration followed by administrator manual approval.

This design implements Google OAuth 2.0 (Gmail sign-in and registration) modelled on the battle-tested, Cloudflare Workers-native architecture in `DMCAAI-Live`.

---

## 2. Requirements & Behavior

1. **Authentication Provider**: Google OAuth 2.0 (`accounts.google.com`).
2. **Scopes**: `openid`, `email`, `profile`.
3. **Approval Policy (Option 1)**: Newly registered Google users will start with `approved = 0` (Pending Admin Review) to maintain access control for internal training material.
4. **Session Management**: Secure HMAC-SHA256 session token signed with `SESSION_SECRET` stored in HttpOnly, Secure, SameSite=Lax cookie `noibo_session` (7 days TTL).
5. **CSRF Protection**: Random UUID state stored in temporary HttpOnly cookie `oauth_state` with 10 minutes TTL.
6. **Backward Compatibility**: Existing email/password accounts and admin approval mechanics (`/api/noibo/admin`) remain fully functional.

---

## 3. Architecture & Data Flow

```
[User clicks "Đăng nhập bằng Google" at /vi/noi-bo]
       │
       ▼
[GET /api/auth/google/login?redirect=/vi/noi-bo]
  • Generate state UUID -> set cookie `oauth_state`
  • Store sanitized target path -> set cookie `auth_redirect`
  • Redirect to Google OAuth authorization endpoint
       │
       ▼
[Google Accounts Consent Screen]
       │
       ▼ (User authenticates & consents)
[GET /api/auth/google/callback?code=...&state=...]
  • Validate `state` against `oauth_state` cookie (prevent CSRF)
  • Exchange `code` with Google Token API (`https://oauth2.googleapis.com/token`)
  • Fetch profile with Google UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`)
  • D1 Database lookup:
      - If user exists by email / google_id: link google_id, update avatar/name if changed
      - If new user: INSERT into `video_users` with `email`, `name`, `avatar_url`, `google_id`, `approved = 0`
  • Issue HMAC session token -> set cookie `noibo_session`
  • Clear temporary cookies (`oauth_state`, `auth_redirect`)
  • Redirect to redirect target (`/vi/noi-bo`)
```

---

## 4. Database Schema Migration

File: `migrations/0003_add_google_oauth_to_video_users.sql`

```sql
-- Thêm các cột hỗ trợ Google OAuth vào video_users
ALTER TABLE video_users ADD COLUMN google_id TEXT;
ALTER TABLE video_users ADD COLUMN name TEXT;
ALTER TABLE video_users ADD COLUMN avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_video_users_google_id ON video_users (google_id);
```

Note: In SQLite / D1, existing columns `password_hash` and `salt` will allow empty strings `""` for OAuth users.

---

## 5. Endpoints & Code Changes

### 5.1. `src/pages/api/auth/google/login.ts` (NEW)
- Accepts optional `?redirect=...` parameter.
- Reads `GOOGLE_CLIENT_ID` from `locals` runtime or `import.meta.env`.
- Generates state & redirect cookies.
- Redirects to `https://accounts.google.com/o/oauth2/v2/auth`.

### 5.2. `src/pages/api/auth/google/callback.ts` (NEW)
- Validates CSRF `state`.
- Performs token exchange & fetches user info.
- Queries/updates `video_users` in D1.
- Signs session cookie `noibo_session`.
- Redirects to destination.

### 5.3. `src/lib/videoAuth.ts` (MODIFY)
- Updates `VideoUser` type:
  ```ts
  export type VideoUser = {
      id: number;
      email: string;
      approved: number;
      name?: string | null;
      avatar_url?: string | null;
      google_id?: string | null;
  };
  ```
- Updates `getSessionUser` to SELECT `id, email, approved, name, avatar_url, google_id`.
- Updates `NoiboEnv` type to include `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 5.4. `src/pages/[lang]/noi-bo.astro` (MODIFY)
- Adds a prominent "Đăng nhập bằng tài khoản Google" button with official Google SVG logo and styling.
- Form divider: "HOẶC ĐĂNG NHẬP / ĐĂNG KÝ BẰNG EMAIL".
- Displays Google user profile info (name, email, avatar image with fallback) in pending and approved states.

### 5.5. `src/pages/api/noibo/admin.ts` (MODIFY)
- Updates query to display user `name`, `avatar_url`, and authentication method (Google vs Password) in admin table.

---

## 6. Environment Configuration

### `.env` & `.env.example`
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 7. Verification & Testing Plan

1. **Unit / Logic Verification**:
   - Verify environment parsing and URL redirect generation.
   - Test CSRF state mismatch rejection (HTTP 400).
   - Test database migration execution on local D1.
2. **OAuth Flow Verification**:
   - Test login URL generation: `/api/auth/google/login`.
   - Verify callback handling and user upsert logic.
   - Verify session cookie creation and user state on `/[lang]/noi-bo`.
3. **Admin Verification**:
   - Verify user shows up in `/api/noibo/admin?key=<ADMIN_SECRET>` and can be approved/revoked.
4. **Build & Typecheck**:
   - Run `npx astro check` and `npm run build` to guarantee zero build errors.
