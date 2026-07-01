import { Hono } from "hono";
import { playersService, ratingsService } from "../../container";

const players = new Hono();

players.get("/:username", async (c) => {
  const profile = await playersService.getProfileByUsername(c.req.param("username")!);
  if (!profile) return c.json({ error: "Not found" }, 404);
  return c.json(profile);
});

players.get("/:username/orders", async (c) => {
  const player = await playersService.findByUsername(c.req.param("username")!);
  if (!player) return c.json({ error: "Not found" }, 404);
  return c.json(await playersService.getOrders(player._id));
});

players.get("/:username/rep", async (c) => {
  const player = await playersService.findByUsername(c.req.param("username")!);
  if (!player) return c.json({ error: "Not found" }, 404);
  const rep = await ratingsService.getReputation(player._id);
  return c.json({
    positive: rep.positive ?? 0,
    negative: rep.negative ?? 0,
  });
});

export { players };
