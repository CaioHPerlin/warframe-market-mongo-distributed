import { Hono } from "hono";
import { createRatingSchema } from "@warframe/shared";
import { authMiddleware } from "../middleware/auth";
import * as ratingService from "../services/rating";

const ratings = new Hono();

ratings.get("/", async (c) => {
  const playerId = c.req.query("player_id");
  if (!playerId) return c.json({ error: "player_id query parameter required" }, 400);

  const result = await ratingService.listRatingsByPlayer(playerId);
  return c.json(result);
});

ratings.post("/", authMiddleware, async (c) => {
  const { sub: raterId } = c.get("player");
  const body = await c.req.json();
  const parsed = createRatingSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  try {
    const rating = await ratingService.ratePlayer(raterId, parsed.data);
    return c.json(rating, 201);
  } catch (err) {
    const message = (err as Error).message;
    if (message === "Already rated this player") return c.json({ error: message }, 409);
    if (message === "Cannot rate yourself") return c.json({ error: message }, 400);
    throw err;
  }
});

export { ratings };
