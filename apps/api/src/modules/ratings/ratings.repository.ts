import { type WithId } from "mongodb";
import { getDB } from "../../db/client";
import type { Rating } from "@warframe/shared";

type RatingDoc = Omit<Rating, "_id">;

export class RatingsRepository {
  async findByRatedId(ratedId: string): Promise<Rating[]> {
    const db = await getDB();
    const docs = await db.collection<RatingDoc>("ratings").find({ rated_id: ratedId }).sort({ createdAt: -1 }).limit(100).toArray();
    return docs.map((d) => ({ ...d, _id: d._id.toString() }));
  }

  async findByRaterAndRated(raterId: string, ratedId: string): Promise<Rating | null> {
    const db = await getDB();
    const doc = await db.collection<RatingDoc>("ratings").findOne({ rater_id: raterId, rated_id: ratedId });
    return doc ? { ...doc, _id: doc._id.toString() } : null;
  }

  async insert(doc: RatingDoc): Promise<Rating> {
    const db = await getDB();
    const result = await db.collection<RatingDoc>("ratings").insertOne(doc);
    return { ...doc, _id: result.insertedId.toString() };
  }

  async getReputation(playerId: string): Promise<Record<string, number>> {
    const db = await getDB();
    const agg = await db
      .collection<RatingDoc>("ratings")
      .aggregate([
        { $match: { rated_id: playerId } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ])
      .toArray();

    const reputation: Record<string, number> = {};
    for (const r of agg) reputation[r._id as string] = r.count;
    return reputation;
  }
}
