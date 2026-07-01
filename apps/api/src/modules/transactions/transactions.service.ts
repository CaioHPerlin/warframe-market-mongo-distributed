import { TransactionsRepository, type TransactionWithDetails } from "./transactions.repository";
import { OrdersService } from "../orders/orders.service";
import { PlayersService } from "../players/players.service";
import type { Transaction, CreateTransaction } from "@warframe/shared";

export class TransactionsService {
  constructor(
    private txRepo: TransactionsRepository,
    private ordersService: OrdersService,
    private playersService: PlayersService,
  ) {}

  async list(filter: Record<string, unknown>): Promise<TransactionWithDetails[]> {
    return this.txRepo.find(filter);
  }

  async listPaginated(filter: Record<string, unknown>, page: number, limit: number): Promise<{
    data: TransactionWithDetails[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const { data, total } = await this.txRepo.findPaginated(filter, page, limit);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async completeOrder(playerId: string, input: CreateTransaction): Promise<Transaction | null> {
    const counterparty = await this.playersService.findByUsername(input.counterparty_username);
    if (!counterparty) return null;

    const order = await this.ordersService.get(input.order_id);
    const isSell = order?.order_type === "sell";
    const doc = {
      item_id: order?.item_id ?? "unknown",
      order_id: input.order_id,
      seller_id: isSell ? (order?.player_id ?? playerId) : counterparty._id,
      buyer_id: isSell ? counterparty._id : (order?.player_id ?? playerId),
      platinum: order?.platinum ?? 0,
      quantity: order?.quantity ?? 1,
      completedAt: new Date().toISOString(),
    };

    const tx = await this.txRepo.insert(doc);
    if (order) {
      if (order.quantity > 1) {
        await this.ordersService.updateQuantity(input.order_id, order.quantity - 1);
      } else {
        await this.ordersService.delete(input.order_id);
      }
    }
    return tx;
  }
}
