import { findPlayerById } from "../repositories/player";
import { findOrders } from "../repositories/order";
import { getReputation } from "../repositories/rating";
import type { Order } from "@warframe/shared";

export type PlayerProfile = {
  id: string;
  username: string;
  platform: string;
  createdAt: string;
  reputation: Record<string, number>;
};

export async function getProfile(id: string): Promise<PlayerProfile | null> {
  const player = await findPlayerById(id);
  if (!player) return null;

  const reputation = await getReputation(id);

  return {
    id: player._id,
    username: player.username,
    platform: player.platform,
    createdAt: player.createdAt,
    reputation,
  };
}

export async function getPlayerOrders(id: string): Promise<Order[]> {
  return findOrders({ player_id: id });
}
