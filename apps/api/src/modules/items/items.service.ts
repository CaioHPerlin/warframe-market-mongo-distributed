import { ItemsRepository, type ItemWithPrice, type FindPaginatedOpts } from "./items.repository";

export type ListOptions = FindPaginatedOpts;

export type PaginatedResult = {
  data: ItemWithPrice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export class ItemsService {
  constructor(private itemsRepo: ItemsRepository) {}

  async list(opts: ListOptions): Promise<PaginatedResult> {
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

  async get(id: string): Promise<ItemWithPrice | null> {
    return this.itemsRepo.findById(id);
  }
}
