export class PlayersService {
    playersRepo;
    ratingsService;
    ordersService;
    constructor(playersRepo, ratingsService, ordersService) {
        this.playersRepo = playersRepo;
        this.ratingsService = ratingsService;
        this.ordersService = ordersService;
    }
    async findById(id) {
        return this.playersRepo.findById(id);
    }
    async findByUsername(username) {
        return this.playersRepo.findByUsername(username);
    }
    async create(doc) {
        return this.playersRepo.insert(doc);
    }
    async getProfile(id) {
        const player = await this.playersRepo.findById(id);
        if (!player)
            return null;
        const reputation = await this.ratingsService.getReputation(id);
        return {
            id: player._id,
            username: player.username,
            platform: player.platform,
            createdAt: player.createdAt,
            reputation,
        };
    }
    async getOrders(id) {
        return this.ordersService.list({ player_id: id });
    }
}
//# sourceMappingURL=players.service.js.map