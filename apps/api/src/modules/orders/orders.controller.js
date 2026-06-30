import { Hono } from "hono";
import { createOrderSchema } from "@warframe/shared";
import { authMiddleware } from "../../middleware/auth";
import { ordersService } from "../../container";
const orders = new Hono();
orders.get("/", async (c) => {
    const filter = {};
    const itemId = c.req.query("item_id");
    if (itemId)
        filter.item_id = itemId;
    const platform = c.req.query("platform");
    if (platform)
        filter.platform = platform;
    filter.status = c.req.query("status") ?? "active";
    return c.json(await ordersService.list(filter));
});
orders.get("/:id", async (c) => {
    const order = await ordersService.get(c.req.param("id"));
    if (!order)
        return c.json({ error: "Not found" }, 404);
    return c.json(order);
});
orders.post("/", authMiddleware, async (c) => {
    const { sub: playerId } = c.get("player");
    const body = await c.req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success)
        return c.json({ error: parsed.error.flatten() }, 400);
    return c.json(await ordersService.create(playerId, parsed.data), 201);
});
orders.put("/:id", authMiddleware, async (c) => {
    const { sub: playerId } = c.get("player");
    const body = await c.req.json();
    const parsed = createOrderSchema.partial().safeParse(body);
    if (!parsed.success)
        return c.json({ error: parsed.error.flatten() }, 400);
    try {
        const order = await ordersService.update(c.req.param("id"), playerId, parsed.data);
        if (!order)
            return c.json({ error: "Not found" }, 404);
        return c.json(order);
    }
    catch (err) {
        return c.json({ error: err.message }, 403);
    }
});
orders.delete("/:id", authMiddleware, async (c) => {
    const { sub: playerId } = c.get("player");
    try {
        const ok = await ordersService.cancel(c.req.param("id"), playerId);
        if (!ok)
            return c.json({ error: "Not found" }, 404);
        return c.json({ ok: true });
    }
    catch (err) {
        return c.json({ error: err.message }, 403);
    }
});
export { orders };
//# sourceMappingURL=orders.controller.js.map