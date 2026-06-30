import { RatingsRepository } from "./ratings.repository";
import type { Rating, CreateRating } from "@warframe/shared";
export declare class RatingsService {
    private ratingsRepo;
    constructor(ratingsRepo: RatingsRepository);
    listByPlayer(playerId: string): Promise<Rating[]>;
    rate(raterId: string, input: CreateRating): Promise<Rating | null>;
    getReputation(playerId: string): Promise<Record<string, number>>;
}
//# sourceMappingURL=ratings.service.d.ts.map