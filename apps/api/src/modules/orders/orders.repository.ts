import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Order } from "@warframe/shared";

type OrderDoc = Omit<Order, "_id">;

export class OrdersRepository {
  async find(filter: Record<string, unknown>): Promise<Order[]> {
    const db = await getDB();
    const docs = await db.collection<OrderDoc>("orders").find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return docs.map((d) => ({ ...d, _id: d._id.toString() }));
  }

  async findById(id: string): Promise<Order | null> {
    const db = await getDB();
    const doc = await db.collection<OrderDoc>("orders").findOne({ _id: new ObjectId(id) });
    return doc ? { ...doc, _id: doc._id.toString() } : null;
  }

  async insert(doc: OrderDoc): Promise<Order> {
    const db = await getDB();
    const result = await db.collection<OrderDoc>("orders").insertOne(doc);
    return { ...doc, _id: result.insertedId.toString() };
  }

  async update(id: string, doc: Partial<OrderDoc>): Promise<void> {
    const db = await getDB();
    await db.collection<OrderDoc>("orders").updateOne({ _id: new ObjectId(id) }, { $set: doc });
  }
}
