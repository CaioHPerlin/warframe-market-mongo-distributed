import { getDB } from "../../db/client";
import type { Transaction } from "@warframe/shared";

type TransactionDoc = Omit<Transaction, "_id">;

export class TransactionsRepository {
  async find(filter: Record<string, unknown>): Promise<Transaction[]> {
    const db = await getDB();
    const docs = await db.collection<TransactionDoc>("transactions").find(filter).sort({ completedAt: -1 }).limit(100).toArray();
    return docs.map((d) => ({ ...d, _id: d._id.toString() }));
  }

  async insert(doc: TransactionDoc): Promise<Transaction> {
    const db = await getDB();
    const result = await db.collection<TransactionDoc>("transactions").insertOne(doc);
    return { ...doc, _id: result.insertedId.toString() };
  }
}
