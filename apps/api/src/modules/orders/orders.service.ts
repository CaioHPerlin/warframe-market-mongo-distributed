import { OrdersRepository, type OrderWithPlayer, type FindOrdersOpts } from "./orders.repository";
import type { Order, CreateOrder } from "@warframe/shared";

export type ListOptions = FindOrdersOpts;

export type PaginatedOrdersResult = {
  data: OrderWithPlayer[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export class OrdersService {
  constructor(private ordersRepo: OrdersRepository) {}

  async list(filter: Record<string, unknown>): Promise<OrderWithPlayer[]> {
    return this.ordersRepo.find(filter);
  }

  async listPaginated(opts: FindOrdersOpts): Promise<PaginatedOrdersResult> {
    const { data, total } = await this.ordersRepo.findPaginated(opts);
    return {
      data,
      total,
      page: opts.page,
      limit: opts.limit,
      pages: Math.ceil(total / opts.limit),
    };
  }

  async get(id: string): Promise<Order | null> {
    return this.ordersRepo.findById(id);
  }

  async create(playerId: string, input: CreateOrder): Promise<Order> {
    const now = new Date().toISOString();
    return this.ordersRepo.insert({
      ...input,
      player_id: playerId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(orderId: string, playerId: string, input: Partial<CreateOrder>): Promise<Order | null> {
    const existing = await this.ordersRepo.findById(orderId);
    if (!existing) return null;
    if (existing.player_id !== playerId) throw new Error("Forbidden");

    await this.ordersRepo.update(orderId, { ...input, updatedAt: new Date().toISOString() });
    return this.ordersRepo.findById(orderId);
  }

  async cancel(orderId: string, playerId: string): Promise<boolean> {
    const existing = await this.ordersRepo.findById(orderId);
    if (!existing) return false;
    if (existing.player_id !== playerId) throw new Error("Forbidden");

    await this.ordersRepo.update(orderId, { status: "cancelled", updatedAt: new Date().toISOString() });
    return true;
  }

  async updateQuantity(orderId: string, quantity: number): Promise<void> {
    await this.ordersRepo.update(orderId, { quantity, updatedAt: new Date().toISOString() });
  }

  async setStatus(orderId: string, status: string): Promise<void> {
    await this.ordersRepo.update(orderId, { status, updatedAt: new Date().toISOString() });
  }

  async delete(orderId: string): Promise<void> {
    await this.ordersRepo.delete(orderId);
  }
}
