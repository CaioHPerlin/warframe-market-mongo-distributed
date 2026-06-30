import type { Context, Next } from "hono";
import { verifyToken, type JwtPayload } from "../lib/jwt";

declare module "hono" {
  interface ContextVariableMap {
    player: JwtPayload;
  }
}

function getCookie(c: Context, name: string): string | null {
  const cookie = c.req.header("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Invalid or expired token" }, 401);

  c.set("player", payload);
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "token");
  if (token) {
    const payload = await verifyToken(token);
    if (payload) c.set("player", payload);
  }
  await next();
}
