const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function base64url(data) {
    return btoa(String.fromCharCode(...new Uint8Array(data)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
async function hmacSha256(secret, data) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return base64url(sig);
}
export async function signToken(payload) {
    const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const now = Math.floor(Date.now() / 1000);
    const body = base64url(new TextEncoder().encode(JSON.stringify({ ...payload, iat: now, exp: now + 86400 * 7 })));
    const signature = await hmacSha256(JWT_SECRET, `${header}.${body}`);
    return `${header}.${body}.${signature}`;
}
export async function verifyToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3)
        return null;
    const [header, body, sig] = parts;
    const expected = await hmacSha256(JWT_SECRET, `${header}.${body}`);
    if (sig !== expected)
        return null;
    try {
        const payload = JSON.parse(atob(body));
        if (payload.exp < Math.floor(Date.now() / 1000))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map