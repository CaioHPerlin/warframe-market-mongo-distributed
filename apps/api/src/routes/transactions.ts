import { Hono } from "hono";
import { getDB } from "../db/client";
import { createTransactionSchema } from "@warframe/shared";
import { authMiddleware } from "../middleware/auth";
import { ObjectId } from "mongodb";

const transactions = new Hono();

transactions.get("/", async (c) => {
  const db = await getDB();
  const filter: Record<string, unknown> = {};

  const itemId = c.req.query("item_id");
  if (itemId) filter.item_id = itemId;

  const playerId = c.req.query("player_id");
  if (playerId) {
    filter.$or = [{ seller_id: playerId }, { buyer_id: playerId }];
  }

  const docs = await db.collection("transactions").find(filter).sort({ completedAt: -1 }).limit(100).toArray();
  return c.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
});

transactions.post("/", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const db = await getDB();
  const order = await db.collection("orders").findOne({
    _id: new ObjectId(parsed.data.order_id),
    status: "active",
  });
  if (!order) return c.json({ error: "Order not found or already completed" }, 404);

  const doc = {
    item_id: order.item_id,
    order_id: order._id.toString(),
    seller_id: order.order_type === "sell" ? order.player_id : parsed.data.buyer_id,
    buyer_id: order.order_type === "sell" ? parsed.data.buyer_id : order.player_id,
    platinum: order.platinum,
    quantity: order.quantity,
    completedAt: new Date().toISOString(),
  };

  const result = await db.collection("transactions").insertOne(doc);

  await db.collection("orders").updateOne(
    { _id: order._id },
    { $set: { status: "completed", updatedAt: new Date().toISOString() } },
  );

  return c.json({ ...doc, _id: result.insertedId.toString() }, 201);
});

export { transactions };
