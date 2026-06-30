import { Hono } from "hono";
import * as playerService from "../services/player";

const players = new Hono();

players.get("/:id", async (c) => {
  const profile = await playerService.getProfile(c.req.param("id"));
  if (!profile) return c.json({ error: "Not found" }, 404);
  return c.json(profile);
});

players.get("/:id/orders", async (c) => {
  const orders = await playerService.getPlayerOrders(c.req.param("id"));
  return c.json(orders);
});

export { players };
