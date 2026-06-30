import { ObjectId, type WithId } from "mongodb";
import { getDB } from "../db/client";
import type { Item } from "@warframe/shared";

type ItemDoc = Omit<Item, "_id">;

function toItem(doc: WithId<ItemDoc>): Item {
  return { ...doc, _id: doc._id.toString() };
}

export async function findItems(search?: string): Promise<Item[]> {
  const db = await getDB();
  const filter: Record<string, unknown> = {};
  if (search) filter.item_name = { $regex: search, $options: "i" };

  const docs = await db.collection<ItemDoc>("items").find(filter).limit(100).toArray();
  return docs.map(toItem);
}

export async function findItemById(id: string): Promise<Item | null> {
  const db = await getDB();
  const doc = await db.collection<ItemDoc>("items").findOne({ _id: new ObjectId(id) });
  return doc ? toItem(doc) : null;
}

export async function insertItems(items: ItemDoc[]): Promise<number> {
  const db = await getDB();
  const result = await db.collection<ItemDoc>("items").insertMany(items);
  return result.insertedCount;
}
