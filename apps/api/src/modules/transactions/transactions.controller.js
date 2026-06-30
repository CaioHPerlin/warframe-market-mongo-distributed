import { Hono } from "hono";
import { createTransactionSchema } from "@warframe/shared";
import { authMiddleware } from "../../middleware/auth";
import { transactionsService } from "../../container";
const transactions = new Hono();
transactions.get("/", async (c) => {
    const filter = {};
    const itemId = c.req.query("item_id");
    if (itemId)
        filter.item_id = itemId;
    const playerId = c.req.query("player_id");
    if (playerId)
        filter.$or = [{ seller_id: playerId }, { buyer_id: playerId }];
    return c.json(await transactionsService.list(filter));
});
transactions.post("/", authMiddleware, async (c) => {
    const { sub: playerId } = c.get("player");
    const body = await c.req.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success)
        return c.json({ error: parsed.error.flatten() }, 400);
    const tx = await transactionsService.completeOrder(playerId, parsed.data);
    if (!tx)
        return c.json({ error: "Order not found or already completed" }, 404);
    return c.json(tx, 201);
});
export { transactions };
//# sourceMappingURL=transactions.controller.js.map