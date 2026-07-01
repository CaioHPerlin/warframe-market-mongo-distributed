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

export class PlayersService {
  constructor(
    private playersRepo: PlayersRepository,
    private ratingsService: RatingsService,
    private ordersService: OrdersService,
  ) {}

  async findById(id: string): Promise<Player | null> {
    return this.playersRepo.findById(id);
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.playersRepo.findByUsername(username);
  }

  async create(doc: Omit<Player, "_id">): Promise<string> {
    return this.playersRepo.insert(doc);
  }

  async getProfileByUsername(username: string): Promise<PlayerProfile | null> {
    const player = await this.playersRepo.findByUsername(username);
    if (!player) return null;

    const reputation = await this.ratingsService.getReputation(player._id);

    return {
      id: player._id,
      username: player.username,
      platform: player.platform,
      createdAt: player.createdAt,
      reputation,
    };
  }

  async getOrders(id: string): Promise<Order[]> {
    return this.ordersService.list({ player_id: id });
  }
}
