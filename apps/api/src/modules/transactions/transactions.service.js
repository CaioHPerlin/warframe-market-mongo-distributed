export class TransactionsService {
    txRepo;
    ordersService;
    constructor(txRepo, ordersService) {
        this.txRepo = txRepo;
        this.ordersService = ordersService;
    }
    async list(filter) {
        return this.txRepo.find(filter);
    }
    async completeOrder(playerId, input) {
        const order = await this.ordersService.get(input.order_id);
        if (!order || order.status !== "active")
            return null;
        const doc = {
            item_id: order.item_id,
            order_id: order._id,
            seller_id: order.order_type === "sell" ? order.player_id : input.buyer_id,
            buyer_id: order.order_type === "sell" ? input.buyer_id : order.player_id,
            platinum: order.platinum,
            quantity: order.quantity,
            completedAt: new Date().toISOString(),
        };
        const tx = await this.txRepo.insert(doc);
        await this.ordersService.setStatus(order._id, "completed");
        return tx;
    }
}
//# sourceMappingURL=transactions.service.js.map