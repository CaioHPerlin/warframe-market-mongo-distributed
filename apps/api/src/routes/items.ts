import { Hono } from "hono";
import * as itemService from "../services/item";

const items = new Hono();

items.get("/", async (c) => {
  const search = c.req.query("q");
  const result = await itemService.listItems(search);
  return c.json(result);
});

items.get("/:id", async (c) => {
  const item = await itemService.getItem(c.req.param("id"));
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});

export { items };
