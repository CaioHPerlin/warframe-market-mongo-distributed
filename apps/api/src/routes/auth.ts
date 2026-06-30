import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { registerSchema, loginSchema } from "@warframe/shared";
import * as authService from "../services/auth";
import { authMiddleware } from "../middleware/auth";
import { findPlayerById } from "../repositories/player";

const auth = new Hono();

auth.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  try {
    const result = await authService.register(parsed.data);
    setCookie(c, "token", result.token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 604800,
    });
    return c.json({ id: result.id, username: result.username, platform: result.platform }, 201);
  } catch (err) {
    const message = (err as Error).message;
    if (message === "Username taken") return c.json({ error: message }, 409);
    throw err;
  }
});

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  try {
    const result = await authService.login(parsed.data);
    setCookie(c, "token", result.token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 604800,
    });
    return c.json({ id: result.id, username: result.username, platform: result.platform });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 401);
  }
});

auth.post("/logout", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", authMiddleware, async (c) => {
  const { sub } = c.get("player");
  const player = await findPlayerById(sub);
  if (!player) return c.json({ error: "Not found" }, 404);

  return c.json({
    id: player._id,
    username: player.username,
    platform: player.platform,
    createdAt: player.createdAt,
  });
});

export { auth };
