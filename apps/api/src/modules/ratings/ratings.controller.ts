import { Hono } from "hono";
import { createRatingSchema } from "@warframe/shared";
import { authMiddleware } from "../../middleware/auth";
import { ratingsService } from "../../container";

const ratings = new Hono();

ratings.get("/", async (c) => {
  const playerId = c.req.query("player_id");
  if (!playerId) return c.json({ error: "player_id query parameter required" }, 400);

  return c.json(await ratingsService.listByPlayer(playerId));
});

ratings.post("/", authMiddleware, async (c) => {
  const { sub: raterId } = c.get("player");
  const body = await c.req.json();
  const parsed = createRatingSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  try {
    return c.json(await ratingsService.rate(raterId, parsed.data), 201);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "Already rated this player") return c.json({ error: msg }, 409);
    if (msg === "Cannot rate yourself") return c.json({ error: msg }, 400);
    throw err;
  }
});

export { ratings };
