import { Hono } from "hono";
import { playersService } from "../../container";
const players = new Hono();
players.get("/:id", async (c) => {
    const profile = await playersService.getProfile(c.req.param("id"));
    if (!profile)
        return c.json({ error: "Not found" }, 404);
    return c.json(profile);
});
players.get("/:id/orders", async (c) => {
    return c.json(await playersService.getOrders(c.req.param("id")));
});
export { players };
//# sourceMappingURL=players.controller.js.map