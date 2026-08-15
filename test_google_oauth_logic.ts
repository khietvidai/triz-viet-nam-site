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

function sanitizeRedirectPath(path: string | null | undefined, fallback: string): string {
    if (!path || !path.startsWith('/') || path.startsWith('//')) {
        return fallback;
    }
    return path;
}

const url = buildGoogleAuthUrl("test-client-id", "http://localhost:4321/api/auth/google/callback", "uuid-1234");
if (!url.includes("client_id=test-client-id") || !url.includes("state=uuid-1234")) {
    throw new Error("Invalid Google Auth URL generation");
}

if (sanitizeRedirectPath("https://malicious.com", "/vi/noi-bo") !== "/vi/noi-bo") {
    throw new Error("Redirect sanitization failed open redirect test");
}

if (sanitizeRedirectPath("/en/noi-bo", "/vi/noi-bo") !== "/en/noi-bo") {
    throw new Error("Redirect sanitization failed valid local path");
}

console.log("OAuth logic tests: PASS");
