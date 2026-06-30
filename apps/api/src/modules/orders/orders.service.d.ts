import { OrdersRepository, type OrderWithPlayer } from "./orders.repository";
import type { Order, CreateOrder } from "@warframe/shared";
export declare class OrdersService {
    private ordersRepo;
    constructor(ordersRepo: OrdersRepository);
    list(filter: Record<string, unknown>): Promise<OrderWithPlayer[]>;
    get(id: string): Promise<Order | null>;
    create(playerId: string, input: CreateOrder): Promise<Order>;
    update(orderId: string, playerId: string, input: Partial<CreateOrder>): Promise<Order | null>;
    cancel(orderId: string, playerId: string): Promise<boolean>;
    setStatus(orderId: string, status: string): Promise<void>;
}
//# sourceMappingURL=orders.service.d.ts.map