import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { getDB } from "../db/client";
import { registerSchema, loginSchema } from "@warframe/shared";
import { signToken } from "../lib/jwt";
import { authMiddleware } from "../middleware/auth";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const auth = new Hono();

auth.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const { username, password, platform } = parsed.data;
  const db = await getDB();

  const existing = await db.collection("players").findOne({ username });
  if (existing) return c.json({ error: "Username taken" }, 409);

  const password_hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const doc = { username, password_hash, platform, createdAt: now };
  const result = await db.collection("players").insertOne(doc);

  const token = await signToken({ sub: result.insertedId.toString(), username });
  setCookie(c, "token", token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 604800,
  });

  return c.json({ id: result.insertedId.toString(), username, platform }, 201);
});

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const { username, password } = parsed.data;
  const db = await getDB();

  const player = await db.collection("players").findOne({ username });
  if (!player) return c.json({ error: "Invalid credentials" }, 401);

  const valid = await bcrypt.compare(password, player.password_hash);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const token = await signToken({ sub: player._id.toString(), username: player.username });
  setCookie(c, "token", token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 604800,
  });

  return c.json({ id: player._id.toString(), username: player.username, platform: player.platform });
});

auth.post("/logout", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", authMiddleware, async (c) => {
  const { sub } = c.get("player");
  const db = await getDB();
  const player = await db.collection("players").findOne({ _id: new ObjectId(sub) });
  if (!player) return c.json({ error: "Not found" }, 404);

  return c.json({
    id: player._id.toString(),
    username: player.username,
    platform: player.platform,
    createdAt: player.createdAt,
  });
});

export { auth };
