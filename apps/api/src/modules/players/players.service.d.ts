import { PlayersRepository } from "./players.repository";
import { RatingsService } from "../ratings/ratings.service";
import { OrdersService } from "../orders/orders.service";
import type { Order, Player } from "@warframe/shared";
export type PlayerProfile = {
    id: string;
    username: string;
    platform: string;
    createdAt: string;
    reputation: Record<string, number>;
};
export declare class PlayersService {
    private playersRepo;
    private ratingsService;
    private ordersService;
    constructor(playersRepo: PlayersRepository, ratingsService: RatingsService, ordersService: OrdersService);
    findById(id: string): Promise<Player | null>;
    findByUsername(username: string): Promise<Player | null>;
    create(doc: Omit<Player, "_id">): Promise<string>;
    getProfile(id: string): Promise<PlayerProfile | null>;
    getOrders(id: string): Promise<Order[]>;
}
//# sourceMappingURL=players.service.d.ts.map