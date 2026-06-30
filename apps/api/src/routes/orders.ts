import { Hono } from "hono";
import { getDB } from "../db/client";
import { createOrderSchema } from "@warframe/shared";
import { authMiddleware } from "../middleware/auth";
import { ObjectId } from "mongodb";

const orders = new Hono();

orders.get("/", async (c) => {
  const db = await getDB();
  const filter: Record<string, unknown> = {};

  const itemId = c.req.query("item_id");
  if (itemId) filter.item_id = itemId;

  const platform = c.req.query("platform");
  if (platform) filter.platform = platform;

  const status = c.req.query("status");
  if (status) filter.status = status;
  else filter.status = "active";

  const docs = await db.collection("orders").find(filter).sort({ createdAt: -1 }).limit(100).toArray();
  return c.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
});

orders.get("/:id", async (c) => {
  const db = await getDB();
  const doc = await db.collection("orders").findOne({ _id: new ObjectId(c.req.param("id")) });
  if (!doc) return c.json({ error: "Not found" }, 404);
  return c.json({ ...doc, _id: doc._id.toString() });
});

orders.post("/", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const db = await getDB();
  const now = new Date().toISOString();
  const doc = {
    ...parsed.data,
    player_id: playerId,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("orders").insertOne(doc);
  return c.json({ ...doc, _id: result.insertedId.toString() }, 201);
});

orders.put("/:id", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const db = await getDB();
  const id = c.req.param("id");

  const existing = await db.collection("orders").findOne({ _id: new ObjectId(id) });
  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.player_id !== playerId) return c.json({ error: "Forbidden" }, 403);

  const body = await c.req.json();
  const parsed = createOrderSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const update = { $set: { ...parsed.data, updatedAt: new Date().toISOString() } };
  await db.collection("orders").updateOne({ _id: new ObjectId(id) }, update);

  const updated = await db.collection("orders").findOne({ _id: new ObjectId(id) });
  return c.json({ ...updated, _id: updated!._id.toString() });
});

orders.delete("/:id", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const db = await getDB();
  const id = c.req.param("id");

  const existing = await db.collection("orders").findOne({ _id: new ObjectId(id) });
  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.player_id !== playerId) return c.json({ error: "Forbidden" }, 403);

  await db.collection("orders").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "cancelled", updatedAt: new Date().toISOString() } },
  );

  return c.json({ ok: true });
});

export { orders };
