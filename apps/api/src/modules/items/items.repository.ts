import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Item } from "@warframe/shared";

type ItemDoc = Omit<Item, "_id">;

export type FindPaginatedOpts = {
  q?: string;
  tag?: string;
  page: number;
  limit: number;
};

export class ItemsRepository {
  async findPaginated(opts: FindPaginatedOpts): Promise<{ data: Item[]; total: number }> {
    const db = await getDB();
    const filter: Record<string, unknown> = {};
    if (opts.q) filter.item_name = { $regex: opts.q, $options: "i" };
    if (opts.tag) filter.tags = opts.tag;

    const [results, total] = await Promise.all([
      db
        .collection<ItemDoc>("items")
        .find(filter)
        .sort({ item_name: 1 })
        .skip((opts.page - 1) * opts.limit)
        .limit(opts.limit)
        .toArray(),
      db.collection<ItemDoc>("items").countDocuments(filter),
    ]);

    return {
      data: results.map((d) => ({ ...d, _id: d._id.toString() })),
      total,
    };
  }

  async findAllTags(): Promise<string[]> {
    const db = await getDB();
    const result = await db
      .collection<ItemDoc>("items")
      .distinct("tags");
    return (result as string[]).sort();
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
