import { ItemsRepository } from "./items.repository";
import type { Item } from "@warframe/shared";
export declare class ItemsService {
    private itemsRepo;
    constructor(itemsRepo: ItemsRepository);
    list(search?: string): Promise<Item[]>;
    get(id: string): Promise<Item | null>;
}
//# sourceMappingURL=items.service.d.ts.map