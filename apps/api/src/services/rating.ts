import { findRatingsByRatedId, findRatingByRaterAndRated, insertRating } from "../repositories/rating";
import type { Rating, CreateRating } from "@warframe/shared";

export async function listRatingsByPlayer(playerId: string): Promise<Rating[]> {
  return findRatingsByRatedId(playerId);
}

export async function ratePlayer(raterId: string, input: CreateRating): Promise<Rating | null> {
  if (input.rated_id === raterId) throw new Error("Cannot rate yourself");

  const existing = await findRatingByRaterAndRated(raterId, input.rated_id);
  if (existing) throw new Error("Already rated this player");

  return insertRating({
    rater_id: raterId,
    rated_id: input.rated_id,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  });
}
