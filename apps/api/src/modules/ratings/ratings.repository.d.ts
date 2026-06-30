import type { Rating } from "@warframe/shared";
type RatingDoc = Omit<Rating, "_id">;
export declare class RatingsRepository {
    findByRatedId(ratedId: string): Promise<Rating[]>;
    findByRaterAndRated(raterId: string, ratedId: string): Promise<Rating | null>;
    insert(doc: RatingDoc): Promise<Rating>;
    getReputation(playerId: string): Promise<Record<string, number>>;
}
export {};
//# sourceMappingURL=ratings.repository.d.ts.map