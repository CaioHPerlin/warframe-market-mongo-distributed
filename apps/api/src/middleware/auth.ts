import type { Context, Next } from "hono";
import { verifyToken, type JwtPayload } from "../lib/jwt";

declare module "hono" {
  interface ContextVariableMap {
    player: JwtPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.cookie("token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = await verifyToken(token);
  if (!payload) return c.json({ error: "Invalid or expired token" }, 401);

  c.set("player", payload);
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const token = c.req.cookie("token");
  if (token) {
    const payload = await verifyToken(token);
    if (payload) c.set("player", payload);
  }
  await next();
}
