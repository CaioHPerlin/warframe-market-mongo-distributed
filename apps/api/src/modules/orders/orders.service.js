export class OrdersService {
    ordersRepo;
    constructor(ordersRepo) {
        this.ordersRepo = ordersRepo;
    }
    async list(filter) {
        return this.ordersRepo.find(filter);
    }
    async get(id) {
        return this.ordersRepo.findById(id);
    }
    async create(playerId, input) {
        const now = new Date().toISOString();
        return this.ordersRepo.insert({
            ...input,
            player_id: playerId,
            status: "active",
            createdAt: now,
            updatedAt: now,
        });
    }
    async update(orderId, playerId, input) {
        const existing = await this.ordersRepo.findById(orderId);
        if (!existing)
            return null;
        if (existing.player_id !== playerId)
            throw new Error("Forbidden");
        await this.ordersRepo.update(orderId, { ...input, updatedAt: new Date().toISOString() });
        return this.ordersRepo.findById(orderId);
    }
    async cancel(orderId, playerId) {
        const existing = await this.ordersRepo.findById(orderId);
        if (!existing)
            return false;
        if (existing.player_id !== playerId)
            throw new Error("Forbidden");
        await this.ordersRepo.update(orderId, { status: "cancelled", updatedAt: new Date().toISOString() });
        return true;
    }
    async setStatus(orderId, status) {
        await this.ordersRepo.update(orderId, { status, updatedAt: new Date().toISOString() });
    }
}
//# sourceMappingURL=orders.service.js.map