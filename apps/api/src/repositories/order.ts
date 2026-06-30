import { ObjectId, type WithId } from "mongodb";
import { getDB } from "../db/client";
import type { Order } from "@warframe/shared";

export type OrderDoc = Omit<Order, "_id">;

function toOrder(doc: WithId<OrderDoc>): Order {
  return { ...doc, _id: doc._id.toString() };
}

export async function findOrders(filter: Record<string, unknown>): Promise<Order[]> {
  const db = await getDB();
  const docs = await db.collection<OrderDoc>("orders").find(filter).sort({ createdAt: -1 }).limit(100).toArray();
  return docs.map(toOrder);
}

export async function findOrderById(id: string): Promise<Order | null> {
  const db = await getDB();
  const doc = await db.collection<OrderDoc>("orders").findOne({ _id: new ObjectId(id) });
  return doc ? toOrder(doc) : null;
}

export async function insertOrder(doc: OrderDoc): Promise<Order> {
  const db = await getDB();
  const result = await db.collection<OrderDoc>("orders").insertOne(doc);
  return { ...doc, _id: result.insertedId.toString() };
}

export async function updateOrder(id: string, doc: Partial<OrderDoc>): Promise<void> {
  const db = await getDB();
  await db.collection<OrderDoc>("orders").updateOne({ _id: new ObjectId(id) }, { $set: doc });
}
