import { Hono } from "hono";
import { createTransactionSchema } from "@warframe/shared";
import { authMiddleware } from "../middleware/auth";
import * as transactionService from "../services/transaction";

const transactions = new Hono();

transactions.get("/", async (c) => {
  const filter: Record<string, unknown> = {};

  const itemId = c.req.query("item_id");
  if (itemId) filter.item_id = itemId;

  const playerId = c.req.query("player_id");
  if (playerId) {
    filter.$or = [{ seller_id: playerId }, { buyer_id: playerId }];
  }

  const result = await transactionService.listTransactions(filter);
  return c.json(result);
});

transactions.post("/", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const tx = await transactionService.completeOrder(playerId, parsed.data);
  if (!tx) return c.json({ error: "Order not found or already completed" }, 404);

  return c.json(tx, 201);
});

export { transactions };
