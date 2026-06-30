import { z } from "zod";
import { platformEnum } from "./player";
export const orderTypeEnum = z.enum(["buy", "sell"]);
export const orderStatusEnum = z.enum(["active", "completed", "cancelled"]);
export const orderSchema = z.object({
    _id: z.string(),
    platform: platformEnum,
    item_id: z.string(),
    player_id: z.string(),
    order_type: orderTypeEnum,
    platinum: z.number().int().positive(),
    quantity: z.number().int().positive(),
    status: orderStatusEnum,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
export const createOrderSchema = z.object({
    platform: platformEnum,
    item_id: z.string(),
    order_type: orderTypeEnum,
    platinum: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
});
//# sourceMappingURL=order.js.map