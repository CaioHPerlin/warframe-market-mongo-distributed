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

export type ItemWithPrice = Item & {
  minSellPrice?: number;
  avgSellPrice?: number;
  lastTransactionPrice?: number;
};

export class ItemsRepository {
  async findPaginated(opts: FindPaginatedOpts): Promise<{ data: ItemWithPrice[]; total: number }> {
    const db = await getDB();
    const filter: Record<string, unknown> = {};
    if (opts.q) filter.item_name = { $regex: opts.q, $options: "i" };
    if (opts.tag) filter.tags = opts.tag;

    const [results, total] = await Promise.all([
      db
        .collection<ItemDoc>("items")
        .aggregate<ItemDoc & { _prices: { avg: number; min: number }[]; _last_tx: Record<string, unknown>[] }>([
          { $match: filter },
          { $sort: { item_name: 1 } },
          { $skip: (opts.page - 1) * opts.limit },
          { $limit: opts.limit },
          {
            $lookup: {
              from: "orders",
              let: { id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$item_id", "$$id"] },
                    status: "active",
                    order_type: "sell",
                  },
                },
                { $group: { _id: null, avg: { $avg: "$platinum" }, min: { $min: "$platinum" } } },
              ],
              as: "_prices",
            },
          },
          {
            $lookup: {
              from: "transactions",
              let: { id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$item_id", "$$id"] },
                  },
                },
                { $sort: { completedAt: -1 } },
                { $limit: 1 },
              ],
              as: "_last_tx",
            },
          },
        ])
        .toArray(),
      db.collection<ItemDoc>("items").countDocuments(filter),
    ]);

    return {
      data: results.map((d) => {
        const doc = d as ItemDoc & { _prices?: { avg: number; min: number }[]; _last_tx?: Record<string, unknown>[] };
        const { _prices, _last_tx, ...rest } = doc;
        const price = _prices?.[0];
        const lastTx = _last_tx?.[0];
        return {
          ...rest,
          _id: (d as unknown as { _id: ObjectId })._id.toString(),
          minSellPrice: price ? Math.round(price.min) : undefined,
          avgSellPrice: price ? Math.round(price.avg) : undefined,
          lastTransactionPrice: lastTx?.platinum,
        } as ItemWithPrice;
      }),
      total,
    };
  }

  async findAllTags(): Promise<string[]> {
    const db = await getDB();
    const result = await db.collection<ItemDoc>("items").distinct("tags");
    return (result as string[]).sort();
  }

  async findById(id: string): Promise<ItemWithPrice | null> {
    const db = await getDB();
    const results = await db
      .collection<ItemDoc>("items")
      .aggregate<ItemDoc & { _prices?: { avg: number; min: number }[]; _last_tx?: Record<string, unknown>[] }>([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "orders",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$item_id", "$$id"] },
                  status: "active",
                  order_type: "sell",
                },
              },
              { $group: { _id: null, avg: { $avg: "$platinum" }, min: { $min: "$platinum" } } },
            ],
            as: "_prices",
          },
        },
        {
          $lookup: {
            from: "transactions",
            let: { id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$item_id", "$$id"] } } },
              { $sort: { completedAt: -1 } },
              { $limit: 1 },
            ],
            as: "_last_tx",
          },
        },
      ])
      .toArray();
    const d = results[0];
    if (!d) return null;
    const { _prices, _last_tx, ...rest } = d;
    const price = _prices?.[0];
    const lastTx = _last_tx?.[0];
    return {
      ...rest,
      _id: (d as unknown as { _id: ObjectId })._id.toString(),
      minSellPrice: price ? Math.round(price.min) : undefined,
      avgSellPrice: price ? Math.round(price.avg) : undefined,
      lastTransactionPrice: lastTx?.platinum as number | undefined,
    } as ItemWithPrice;
  }

  async insertMany(items: ItemDoc[]): Promise<number> {
    const db = await getDB();
    const result = await db.collection<ItemDoc>("items").insertMany(items);
    return result.insertedCount;
  }
}
