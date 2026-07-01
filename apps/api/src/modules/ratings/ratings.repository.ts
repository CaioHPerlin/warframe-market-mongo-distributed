import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Rating } from "@warframe/shared";

type RatingDoc = Omit<Rating, "_id" | "rated_id" | "rater_id"> & {
  rated_id: ObjectId;
  rater_id: ObjectId;
};

function toRating(doc: RatingDoc & { _id: ObjectId }): Rating {
  return {
    ...doc,
    _id: doc._id.toString(),
    rated_id: doc.rated_id.toString(),
    rater_id: doc.rater_id.toString(),
  };
}

export class RatingsRepository {
  async findByRatedId(ratedId: string): Promise<Rating[]> {
    const db = await getDB();
    const docs = await db
      .collection<RatingDoc>("ratings")
      .find({ rated_id: new ObjectId(ratedId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return docs.map(toRating);
  }

  async findByRaterAndRated(raterId: string, ratedId: string): Promise<Rating | null> {
    const db = await getDB();
    const doc = await db
      .collection<RatingDoc>("ratings")
      .findOne({ rater_id: new ObjectId(raterId), rated_id: new ObjectId(ratedId) });
    return doc ? toRating(doc) : null;
  }

  async insert(doc: Omit<Rating, "_id">): Promise<Rating> {
    const db = await getDB();
    const result = await db.collection("ratings").insertOne({
      ...doc,
      rater_id: new ObjectId(doc.rater_id),
      rated_id: new ObjectId(doc.rated_id),
    });
    return { ...doc, _id: result.insertedId.toString() };
  }

  async getReputation(playerId: string): Promise<Record<string, number>> {
    const db = await getDB();
    const agg = await db
      .collection<RatingDoc>("ratings")
      .aggregate([
        { $match: { rated_id: new ObjectId(playerId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ])
      .toArray();

    const reputation: Record<string, number> = {};
    for (const r of agg) reputation[r._id as string] = r.count;
    return reputation;
  }
}
