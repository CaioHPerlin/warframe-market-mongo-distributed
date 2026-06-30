const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function base64url(data: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64url(sig);
}

export type JwtPayload = { sub: string; username: string; iat: number; exp: number };

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    new TextEncoder().encode(JSON.stringify({ ...payload, iat: now, exp: now + 86400 * 7 })),
  );
  const signature = await hmacSha256(JWT_SECRET, `${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = await hmacSha256(JWT_SECRET, `${header}.${body}`);
  if (sig !== expected) return null;
  try {
    const payload: JwtPayload = JSON.parse(atob(body!));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
