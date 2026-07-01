import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Transaction } from "@warframe/shared";

type TransactionDoc = Omit<Transaction, "_id" | "item_id" | "order_id" | "seller_id" | "buyer_id"> & {
  item_id: ObjectId;
  order_id: ObjectId;
  seller_id: ObjectId;
  buyer_id: ObjectId;
};

export type TransactionWithDetails = Transaction & {
  item_name: string;
  seller_username: string;
  buyer_username: string;
};

function toTransaction(doc: TransactionDoc & { _id: ObjectId }): Transaction {
  return {
    ...doc,
    _id: doc._id.toString(),
    item_id: doc.item_id.toString(),
    order_id: doc.order_id.toString(),
    seller_id: doc.seller_id.toString(),
    buyer_id: doc.buyer_id.toString(),
  };
}

function toTransactionWithDetails(doc: Record<string, unknown>): TransactionWithDetails {
  return {
    _id: (doc._id as ObjectId).toString(),
    item_id: (doc.item_id as ObjectId).toString(),
    order_id: (doc.order_id as ObjectId).toString(),
    seller_id: (doc.seller_id as ObjectId).toString(),
    buyer_id: (doc.buyer_id as ObjectId).toString(),
    platinum: doc.platinum as number,
    quantity: doc.quantity as number,
    completedAt: doc.completedAt as string,
    item_name: (doc.item_name as string) ?? "Unknown",
    seller_username: (doc.seller_username as string) ?? "Unknown",
    buyer_username: (doc.buyer_username as string) ?? "Unknown",
  };
}

function toMongoFilter(filter: Record<string, unknown>): Record<string, unknown> {
  const mongoFilter: Record<string, unknown> = { ...filter };
  if (mongoFilter.item_id) mongoFilter.item_id = new ObjectId(mongoFilter.item_id as string);
  if (mongoFilter.order_id) mongoFilter.order_id = new ObjectId(mongoFilter.order_id as string);
  if (mongoFilter.seller_id) mongoFilter.seller_id = new ObjectId(mongoFilter.seller_id as string);
  if (mongoFilter.buyer_id) mongoFilter.buyer_id = new ObjectId(mongoFilter.buyer_id as string);
  if (mongoFilter["$or"]) {
    const orConditions = mongoFilter["$or"] as Record<string, unknown>[];
    mongoFilter["$or"] = orConditions.map((cond) => {
      const c = { ...cond };
      if (c.seller_id) c.seller_id = new ObjectId(c.seller_id as string);
      if (c.buyer_id) c.buyer_id = new ObjectId(c.buyer_id as string);
      return c;
    });
  }
  return mongoFilter;
}

const LOOKUPS = [
  {
    $lookup: { from: "items", localField: "item_id", foreignField: "_id", as: "_item" },
  },
  { $unwind: { path: "$_item", preserveNullAndEmptyArrays: true } },
  {
    $lookup: { from: "players", localField: "seller_id", foreignField: "_id", as: "_seller" },
  },
  { $unwind: { path: "$_seller", preserveNullAndEmptyArrays: true } },
  {
    $lookup: { from: "players", localField: "buyer_id", foreignField: "_id", as: "_buyer" },
  },
  { $unwind: { path: "$_buyer", preserveNullAndEmptyArrays: true } },
  {
    $addFields: {
      item_name: "$_item.item_name",
      seller_username: "$_seller.username",
      buyer_username: "$_buyer.username",
    },
  },
  { $project: { _item: 0, _seller: 0, _buyer: 0 } },
] as const;

export class TransactionsRepository {
  async find(filter: Record<string, unknown>): Promise<TransactionWithDetails[]> {
    const db = await getDB();
    const mongoFilter = toMongoFilter(filter);
    const docs = await db
      .collection("transactions")
      .aggregate([
        { $match: mongoFilter },
        { $sort: { completedAt: -1 } },
        { $limit: 100 },
        ...LOOKUPS,
      ])
      .toArray();
    return docs.map(toTransactionWithDetails);
  }

  async findPaginated(filter: Record<string, unknown>, page: number, limit: number): Promise<{ data: TransactionWithDetails[]; total: number }> {
    const db = await getDB();
    const mongoFilter = toMongoFilter(filter);

    const [docs, total] = await Promise.all([
      db
        .collection("transactions")
        .aggregate([
          { $match: mongoFilter },
          { $sort: { completedAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          ...LOOKUPS,
        ])
        .toArray(),
      db.collection("transactions").countDocuments(mongoFilter),
    ]);

    return { data: docs.map(toTransactionWithDetails), total };
  }

  async insert(doc: Omit<Transaction, "_id">): Promise<Transaction> {
    const db = await getDB();
    const result = await db.collection("transactions").insertOne({
      ...doc,
      item_id: new ObjectId(doc.item_id),
      order_id: new ObjectId(doc.order_id),
      seller_id: new ObjectId(doc.seller_id),
      buyer_id: new ObjectId(doc.buyer_id),
    });
    return { ...doc, _id: result.insertedId.toString() };
  }
}
