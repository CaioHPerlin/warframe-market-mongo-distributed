import { RatingsRepository } from "./ratings.repository";
import type { Rating, CreateRating } from "@warframe/shared";

export class RatingsService {
  constructor(private ratingsRepo: RatingsRepository) {}

  async listByPlayer(playerId: string): Promise<Rating[]> {
    return this.ratingsRepo.findByRatedId(playerId);
  }

  async rate(raterId: string, input: CreateRating): Promise<Rating | null> {
    if (input.rated_id === raterId) throw new Error("Cannot rate yourself");

    const existing = await this.ratingsRepo.findByRaterAndRated(raterId, input.rated_id);
    if (existing) throw new Error("Already rated this player");

    return this.ratingsRepo.insert({
      rater_id: raterId,
      rated_id: input.rated_id,
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    });
  }

  async getReputation(playerId: string): Promise<Record<string, number>> {
    return this.ratingsRepo.getReputation(playerId);
  }
}
