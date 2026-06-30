import { getCookie } from "hono/cookie";
import { verifyToken } from "../lib/jwt";
export async function authMiddleware(c, next) {
    const token = getCookie(c, "token");
    if (!token)
        return c.json({ error: "Unauthorized" }, 401);
    const payload = await verifyToken(token);
    if (!payload)
        return c.json({ error: "Invalid or expired token" }, 401);
    c.set("player", payload);
    await next();
}
export async function optionalAuthMiddleware(c, next) {
    const token = getCookie(c, "token");
    if (token) {
        const payload = await verifyToken(token);
        if (payload)
            c.set("player", payload);
    }
    await next();
}
//# sourceMappingURL=auth.js.map