import { Hono } from "hono";
import { createOrderSchema } from "@warframe/shared";
import { authMiddleware } from "../../middleware/auth";
import { ordersService } from "../../container";

const orders = new Hono();

orders.get("/", async (c) => {
  const filter: Record<string, unknown> = {};
  const itemId = c.req.query("item_id");
  if (itemId) filter.item_id = itemId;
  const playerId2 = c.req.query("player_id");
  if (playerId2) filter.player_id = playerId2;
  const platform = c.req.query("platform");
  if (platform) filter.platform = platform;
  const orderType = c.req.query("order_type");
  if (orderType) filter.order_type = orderType;
  filter.status = c.req.query("status") ?? "active";

  const page = Math.max(1, parseInt(c.req.query("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") ?? "20", 10)));

  const hasPagination = c.req.query("page") !== undefined || c.req.query("limit") !== undefined;

  if (hasPagination) {
    return c.json(await ordersService.listPaginated({ filter, page, limit }));
  }

  return c.json(await ordersService.list(filter));
});

orders.get("/:id", async (c) => {
  const order = await ordersService.get(c.req.param("id")!);
  if (!order) return c.json({ error: "Not found" }, 404);
  return c.json(order);
});

orders.post("/", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  return c.json(await ordersService.create(playerId, parsed.data), 201);
});

orders.put("/:id", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createOrderSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  try {
    const order = await ordersService.update(c.req.param("id")!, playerId, parsed.data);
    if (!order) return c.json({ error: "Not found" }, 404);
    return c.json(order);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 403);
  }
});

orders.delete("/:id", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");

  try {
    const ok = await ordersService.cancel(c.req.param("id")!, playerId);
    if (!ok) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 403);
  }
});

export { orders };
