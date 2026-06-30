import type { Order } from "@warframe/shared";
type OrderDoc = Omit<Order, "_id">;
export type OrderWithPlayer = Order & {
    player_username: string;
};
export declare class OrdersRepository {
    find(filter: Record<string, unknown>): Promise<OrderWithPlayer[]>;
    findById(id: string): Promise<Order | null>;
    insert(doc: OrderDoc): Promise<Order>;
    update(id: string, doc: Partial<OrderDoc>): Promise<void>;
}
export {};
//# sourceMappingURL=orders.repository.d.ts.map