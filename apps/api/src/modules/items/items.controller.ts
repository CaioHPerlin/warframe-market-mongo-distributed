import { Hono } from "hono";
import { itemsService } from "../../container";

const items = new Hono();

items.get("/", async (c) => {
  const q = c.req.query("q");
  const tag = c.req.query("tag");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 24));
  return c.json(await itemsService.list({ q, tag, page, limit }));
});

items.get("/tags", async (c) => {
  return c.json(await itemsService.listTags());
});

items.get("/:id", async (c) => {
  const item = await itemsService.get(c.req.param("id")!);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});

export { items };
