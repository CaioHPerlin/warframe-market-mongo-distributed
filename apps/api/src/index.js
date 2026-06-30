import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ensureSchema } from "./db/schema";
import { auth } from "./modules/auth/auth.controller";
import { items } from "./modules/items/items.controller";
import { orders } from "./modules/orders/orders.controller";
import { players } from "./modules/players/players.controller";
import { ratings } from "./modules/ratings/ratings.controller";
import { transactions } from "./modules/transactions/transactions.controller";
const app = new Hono();
app.use("*", logger());
app.use("*", cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));
app.route("/api/auth", auth);
app.route("/api/items", items);
app.route("/api/orders", orders);
app.route("/api/transactions", transactions);
app.route("/api/ratings", ratings);
app.route("/api/players", players);
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
});
const port = 3000;
console.log(`Initializing schema...`);
ensureSchema()
    .then(() => {
    console.log(`Server running on http://localhost:${port}`);
})
    .catch(console.error);
export default {
    port,
    fetch: app.fetch,
};
//# sourceMappingURL=index.js.map