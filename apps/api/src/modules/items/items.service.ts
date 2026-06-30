import { ItemsRepository } from "./items.repository";
import type { Item } from "@warframe/shared";

export type ListOptions = {
  q?: string;
  tag?: string;
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export class ItemsService {
  constructor(private itemsRepo: ItemsRepository) {}

  async list(opts: ListOptions): Promise<PaginatedResult<Item>> {
    const { data, total } = await this.itemsRepo.findPaginated(opts);
    return {
      data,
      total,
      page: opts.page,
      limit: opts.limit,
      pages: Math.ceil(total / opts.limit),
    };
  }

  async listTags(): Promise<string[]> {
    return this.itemsRepo.findAllTags();
  }

  async get(id: string): Promise<Item | null> {
    return this.itemsRepo.findById(id);
  }
}
