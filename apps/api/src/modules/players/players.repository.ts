import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Player } from "@warframe/shared";

type PlayerDoc = Omit<Player, "_id">;

export class PlayersRepository {
  async findById(id: string): Promise<Player | null> {
    const db = await getDB();
    const doc = await db.collection<PlayerDoc>("players").findOne({ _id: new ObjectId(id) });
    return doc ? { ...doc, _id: doc._id.toString() } : null;
  }

  async findByUsername(username: string): Promise<Player | null> {
    const db = await getDB();
    const doc = await db.collection<PlayerDoc>("players").findOne({ username });
    return doc ? { ...doc, _id: doc._id.toString() } : null;
  }

  async insert(doc: PlayerDoc): Promise<string> {
    const db = await getDB();
    const result = await db.collection<PlayerDoc>("players").insertOne(doc);
    return result.insertedId.toString();
  }
}
