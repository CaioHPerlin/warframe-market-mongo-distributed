import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./routes/auth";
import { items } from "./routes/items";
import { orders } from "./routes/orders";
import { transactions } from "./routes/transactions";
import { ratings } from "./routes/ratings";
import { players } from "./routes/players";
import { ensureSchema } from "./db/schema";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

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

const port = parseInt(process.env.PORT || "3000", 10);

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
