import type { Item } from "@warframe/shared";
type ItemDoc = Omit<Item, "_id">;
export declare class ItemsRepository {
    findAll(search?: string): Promise<Item[]>;
    findById(id: string): Promise<Item | null>;
    insertMany(items: ItemDoc[]): Promise<number>;
}
export {};
//# sourceMappingURL=items.repository.d.ts.map