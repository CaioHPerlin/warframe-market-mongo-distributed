import { findTransactions, insertTransaction } from "../repositories/transaction";
import { findOrderById, updateOrder } from "../repositories/order";
import type { Transaction, CreateTransaction } from "@warframe/shared";

export async function listTransactions(filter: Record<string, unknown>): Promise<Transaction[]> {
  return findTransactions(filter);
}

export async function completeOrder(playerId: string, input: CreateTransaction): Promise<Transaction | null> {
  const order = await findOrderById(input.order_id);
  if (!order || order.status !== "active") return null;

  const doc = {
    item_id: order.item_id,
    order_id: order._id,
    seller_id: order.order_type === "sell" ? order.player_id : input.buyer_id,
    buyer_id: order.order_type === "sell" ? input.buyer_id : order.player_id,
    platinum: order.platinum,
    quantity: order.quantity,
    completedAt: new Date().toISOString(),
  };

  const tx = await insertTransaction(doc);
  await updateOrder(order._id, { status: "completed", updatedAt: new Date().toISOString() });

  return tx;
}
