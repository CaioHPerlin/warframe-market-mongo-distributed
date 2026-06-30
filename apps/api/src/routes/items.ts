import { Hono } from "hono";
import { getDB } from "../db/client";
import { ObjectId } from "mongodb";

const items = new Hono();

items.get("/", async (c) => {
  const db = await getDB();
  const search = c.req.query("q");
  const filter: Record<string, unknown> = {};
  if (search) filter.item_name = { $regex: search, $options: "i" };

  const docs = await db.collection("items").find(filter).limit(100).toArray();
  return c.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
});

items.get("/:id", async (c) => {
  const db = await getDB();
  const doc = await db.collection("items").findOne({ _id: new ObjectId(c.req.param("id")) });
  if (!doc) return c.json({ error: "Not found" }, 404);
  return c.json({ ...doc, _id: doc._id.toString() });
});

export { items };
