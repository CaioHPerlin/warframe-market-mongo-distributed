import { Hono } from "hono";
import { getDB } from "../db/client";
import { registerSchema, loginSchema, playerSchema } from "@warframe/shared";
import { signToken, verifyToken } from "../lib/jwt";
import { authMiddleware } from "../middleware/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
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
  const doc = {
    username,
    password_hash,
    platform,
    createdAt: now,
  };

  const result = await db.collection("players").insertOne(doc);

  const player = { sub: result.insertedId.toString(), username, platform };
  const token = await signToken(player);

  c.header("Set-Cookie", `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);
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

  const token = await signToken({
    sub: player._id.toString(),
    username: player.username,
  });

  c.header("Set-Cookie", `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);
  return c.json({ id: player._id.toString(), username: player.username, platform: player.platform });
});

auth.post("/logout", (c) => {
  c.header("Set-Cookie", "token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
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
