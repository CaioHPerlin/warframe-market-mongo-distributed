import { ItemsRepository } from "./items.repository";
import type { Item } from "@warframe/shared";

export class ItemsService {
  constructor(private itemsRepo: ItemsRepository) {}

  async list(search?: string): Promise<Item[]> {
    return this.itemsRepo.findAll(search);
  }

  async get(id: string): Promise<Item | null> {
    return this.itemsRepo.findById(id);
  }
}
