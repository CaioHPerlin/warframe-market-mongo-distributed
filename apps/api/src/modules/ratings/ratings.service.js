export class RatingsService {
    ratingsRepo;
    constructor(ratingsRepo) {
        this.ratingsRepo = ratingsRepo;
    }
    async listByPlayer(playerId) {
        return this.ratingsRepo.findByRatedId(playerId);
    }
    async rate(raterId, input) {
        if (input.rated_id === raterId)
            throw new Error("Cannot rate yourself");
        const existing = await this.ratingsRepo.findByRaterAndRated(raterId, input.rated_id);
        if (existing)
            throw new Error("Already rated this player");
        return this.ratingsRepo.insert({
            rater_id: raterId,
            rated_id: input.rated_id,
            rating: input.rating,
            comment: input.comment,
            createdAt: new Date().toISOString(),
        });
    }
    async getReputation(playerId) {
        return this.ratingsRepo.getReputation(playerId);
    }
}
//# sourceMappingURL=ratings.service.js.map