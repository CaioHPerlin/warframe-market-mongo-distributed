import { ObjectId, type WithId } from "mongodb";
import { getDB } from "../db/client";
import type { Transaction } from "@warframe/shared";

export type TransactionDoc = Omit<Transaction, "_id">;

function toTransaction(doc: WithId<TransactionDoc>): Transaction {
  return { ...doc, _id: doc._id.toString() };
}

export async function findTransactions(filter: Record<string, unknown>): Promise<Transaction[]> {
  const db = await getDB();
  const docs = await db.collection<TransactionDoc>("transactions").find(filter).sort({ completedAt: -1 }).limit(100).toArray();
  return docs.map(toTransaction);
}

export async function insertTransaction(doc: TransactionDoc): Promise<Transaction> {
  const db = await getDB();
  const result = await db.collection<TransactionDoc>("transactions").insertOne(doc);
  return { ...doc, _id: result.insertedId.toString() };
}
