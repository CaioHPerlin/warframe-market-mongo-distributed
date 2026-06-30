import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Item } from "@warframe/shared";

type ItemDoc = Omit<Item, "_id">;

export class ItemsRepository {
  async findAll(search?: string): Promise<Item[]> {
    const db = await getDB();
    const filter: Record<string, unknown> = {};
    if (search) filter.item_name = { $regex: search, $options: "i" };
    const docs = await db.collection<ItemDoc>("items").find(filter).limit(100).toArray();
    return docs.map((d) => ({ ...d, _id: d._id.toString() }));
  }

  async findById(id: string): Promise<Item | null> {
    const db = await getDB();
    const doc = await db.collection<ItemDoc>("items").findOne({ _id: new ObjectId(id) });
    return doc ? { ...doc, _id: doc._id.toString() } : null;
  }

  async insertMany(items: ItemDoc[]): Promise<number> {
    const db = await getDB();
    const result = await db.collection<ItemDoc>("items").insertMany(items);
    return result.insertedCount;
  }
}
