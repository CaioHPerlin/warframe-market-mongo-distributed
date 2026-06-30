import { ObjectId, type WithId } from "mongodb";
import { getDB } from "../db/client";
import type { Player } from "@warframe/shared";

export type PlayerDoc = Omit<Player, "_id">;

function toPlayer(doc: WithId<PlayerDoc>): Player {
  return { ...doc, _id: doc._id.toString() };
}

export async function findPlayerById(id: string): Promise<Player | null> {
  const db = await getDB();
  const doc = await db.collection<PlayerDoc>("players").findOne({ _id: new ObjectId(id) });
  return doc ? toPlayer(doc) : null;
}

export async function findPlayerByUsername(username: string): Promise<Player | null> {
  const db = await getDB();
  const doc = await db.collection<PlayerDoc>("players").findOne({ username });
  return doc ? toPlayer(doc) : null;
}

export async function insertPlayer(doc: PlayerDoc): Promise<string> {
  const db = await getDB();
  const result = await db.collection<PlayerDoc>("players").insertOne(doc);
  return result.insertedId.toString();
}
