import { AuthService } from "./modules/auth/auth.service";
import { ItemsRepository } from "./modules/items/items.repository";
import { ItemsService } from "./modules/items/items.service";
import { OrdersRepository } from "./modules/orders/orders.repository";
import { OrdersService } from "./modules/orders/orders.service";
import { PlayersRepository } from "./modules/players/players.repository";
import { PlayersService } from "./modules/players/players.service";
import { RatingsRepository } from "./modules/ratings/ratings.repository";
import { RatingsService } from "./modules/ratings/ratings.service";
import { TransactionsRepository } from "./modules/transactions/transactions.repository";
import { TransactionsService } from "./modules/transactions/transactions.service";

const playersRepo = new PlayersRepository();
const itemsRepo = new ItemsRepository();
const ordersRepo = new OrdersRepository();
const ratingsRepo = new RatingsRepository();
const txRepo = new TransactionsRepository();

export const ordersService = new OrdersService(ordersRepo);
export const ratingsService = new RatingsService(ratingsRepo);
export const playersService = new PlayersService(
  playersRepo,
  ratingsService,
  ordersService,
);
export const authService = new AuthService(playersService);
export const itemsService = new ItemsService(itemsRepo);
export const transactionsService = new TransactionsService(
  txRepo,
  ordersService,
);
