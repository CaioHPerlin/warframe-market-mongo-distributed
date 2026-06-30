import { findOrders, findOrderById, insertOrder, updateOrder } from "../repositories/order";
import type { Order, CreateOrder } from "@warframe/shared";

export async function listOrders(filter: Record<string, unknown>): Promise<Order[]> {
  return findOrders(filter);
}

export async function getOrder(id: string): Promise<Order | null> {
  return findOrderById(id);
}

export async function createOrder(playerId: string, input: CreateOrder): Promise<Order> {
  const now = new Date().toISOString();
  return insertOrder({
    ...input,
    player_id: playerId,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateOrderById(orderId: string, playerId: string, input: Partial<CreateOrder>): Promise<Order | null> {
  const existing = await findOrderById(orderId);
  if (!existing) return null;
  if (existing.player_id !== playerId) throw new Error("Forbidden");

  const update: Partial<Omit<Order, "_id">> = { ...input, updatedAt: new Date().toISOString() };
  await updateOrder(orderId, update);

  return findOrderById(orderId);
}

export async function cancelOrder(orderId: string, playerId: string): Promise<boolean> {
  const existing = await findOrderById(orderId);
  if (!existing) return false;
  if (existing.player_id !== playerId) throw new Error("Forbidden");

  await updateOrder(orderId, { status: "cancelled", updatedAt: new Date().toISOString() });
  return true;
}
