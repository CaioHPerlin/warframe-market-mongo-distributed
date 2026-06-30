import { Hono } from "hono";
import { getDB } from "../db/client";
import { createRatingSchema } from "@warframe/shared";
import { authMiddleware } from "../middleware/auth";
import { ObjectId } from "mongodb";

const ratings = new Hono();

ratings.get("/", async (c) => {
  const db = await getDB();
  const filter: Record<string, unknown> = {};

  const playerId = c.req.query("player_id");
  if (playerId) filter.rated_id = playerId;

  const docs = await db.collection("ratings").find(filter).sort({ createdAt: -1 }).limit(100).toArray();
  return c.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
});

ratings.post("/", authMiddleware, async (c) => {
  const { sub: raterId } = c.get("player");
  const body = await c.req.json();
  const parsed = createRatingSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  if (parsed.data.rated_id === raterId) {
    return c.json({ error: "Cannot rate yourself" }, 400);
  }

  const db = await getDB();

  const existing = await db.collection("ratings").findOne({
    rater_id: raterId,
    rated_id: parsed.data.rated_id,
  });
  if (existing) return c.json({ error: "Already rated this player" }, 409);

  const doc = {
    rater_id: raterId,
    rated_id: parsed.data.rated_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
    createdAt: new Date().toISOString(),
  };

  const result = await db.collection("ratings").insertOne(doc);
  return c.json({ ...doc, _id: result.insertedId.toString() }, 201);
});

export { ratings };
