import { Hono } from "hono";
import { getDB } from "../db/client";
import { ObjectId } from "mongodb";

const players = new Hono();

players.get("/:id", async (c) => {
  const db = await getDB();
  const id = c.req.param("id");

  const player = await db.collection("players").findOne({ _id: new ObjectId(id) });
  if (!player) return c.json({ error: "Not found" }, 404);

  const ratingsAgg = await db
    .collection("ratings")
    .aggregate([
      { $match: { rated_id: id } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ])
    .toArray();

  const reputation: Record<string, number> = {};
  for (const r of ratingsAgg) reputation[r._id] = r.count;

  return c.json({
    id: player._id.toString(),
    username: player.username,
    platform: player.platform,
    createdAt: player.createdAt,
    reputation,
  });
});

players.get("/:id/orders", async (c) => {
  const db = await getDB();
  const id = c.req.param("id");

  const docs = await db
    .collection("orders")
    .find({ player_id: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return c.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
});

export { players };
