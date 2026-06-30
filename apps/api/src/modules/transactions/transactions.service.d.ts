import { TransactionsRepository } from "./transactions.repository";
import { OrdersService } from "../orders/orders.service";
import type { Transaction, CreateTransaction } from "@warframe/shared";
export declare class TransactionsService {
    private txRepo;
    private ordersService;
    constructor(txRepo: TransactionsRepository, ordersService: OrdersService);
    list(filter: Record<string, unknown>): Promise<Transaction[]>;
    completeOrder(playerId: string, input: CreateTransaction): Promise<Transaction | null>;
}
//# sourceMappingURL=transactions.service.d.ts.map