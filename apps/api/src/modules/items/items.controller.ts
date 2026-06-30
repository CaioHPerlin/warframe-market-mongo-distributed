import { Hono } from "hono";
import { itemsService } from "../../container";

const items = new Hono();

items.get("/", async (c) => {
  return c.json(await itemsService.list(c.req.query("q")));
});

items.get("/:id", async (c) => {
  const item = await itemsService.get(c.req.param("id")!);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});

export { items };
