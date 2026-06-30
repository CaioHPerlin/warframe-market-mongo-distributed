import { Hono } from "hono";
import { createOrderSchema } from "@warframe/shared";
import { authMiddleware } from "../middleware/auth";
import * as orderService from "../services/order";

const orders = new Hono();

orders.get("/", async (c) => {
  const filter: Record<string, unknown> = {};

  const itemId = c.req.query("item_id");
  if (itemId) filter.item_id = itemId;

  const platform = c.req.query("platform");
  if (platform) filter.platform = platform;

  const status = c.req.query("status");
  if (status) filter.status = status;
  else filter.status = "active";

  const result = await orderService.listOrders(filter);
  return c.json(result);
});

orders.get("/:id", async (c) => {
  const order = await orderService.getOrder(c.req.param("id")!);
  if (!order) return c.json({ error: "Not found" }, 404);
  return c.json(order);
});

orders.post("/", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const order = await orderService.createOrder(playerId, parsed.data);
  return c.json(order, 201);
});

orders.put("/:id", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");
  const body = await c.req.json();
  const parsed = createOrderSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  try {
    const order = await orderService.updateOrderById(c.req.param("id")!, playerId, parsed.data);
    if (!order) return c.json({ error: "Not found" }, 404);
    return c.json(order);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 403);
  }
});

orders.delete("/:id", authMiddleware, async (c) => {
  const { sub: playerId } = c.get("player");

  try {
    const ok = await orderService.cancelOrder(c.req.param("id")!, playerId);
    if (!ok) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 403);
  }
});

export { orders };
