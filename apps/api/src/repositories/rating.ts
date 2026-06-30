import { type WithId } from "mongodb";
import { getDB } from "../db/client";
import type { Rating } from "@warframe/shared";

export type RatingDoc = Omit<Rating, "_id">;

function toRating(doc: WithId<RatingDoc>): Rating {
  return { ...doc, _id: doc._id.toString() };
}

export async function findRatingsByRatedId(ratedId: string): Promise<Rating[]> {
  const db = await getDB();
  const docs = await db.collection<RatingDoc>("ratings").find({ rated_id: ratedId }).sort({ createdAt: -1 }).limit(100).toArray();
  return docs.map(toRating);
}

export async function findRatingByRaterAndRated(raterId: string, ratedId: string): Promise<Rating | null> {
  const db = await getDB();
  const doc = await db.collection<RatingDoc>("ratings").findOne({ rater_id: raterId, rated_id: ratedId });
  return doc ? toRating(doc) : null;
}

export async function insertRating(doc: RatingDoc): Promise<Rating> {
  const db = await getDB();
  const result = await db.collection<RatingDoc>("ratings").insertOne(doc);
  return { ...doc, _id: result.insertedId.toString() };
}

export async function getReputation(playerId: string): Promise<Record<string, number>> {
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
