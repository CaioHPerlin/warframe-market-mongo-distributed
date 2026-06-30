export class ItemsService {
    itemsRepo;
    constructor(itemsRepo) {
        this.itemsRepo = itemsRepo;
    }
    async list(search) {
        return this.itemsRepo.findAll(search);
    }
    async get(id) {
        return this.itemsRepo.findById(id);
    }
}
//# sourceMappingURL=items.service.js.map