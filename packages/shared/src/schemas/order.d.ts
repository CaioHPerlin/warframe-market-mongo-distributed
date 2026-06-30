import { z } from "zod";
export declare const orderTypeEnum: z.ZodEnum<["buy", "sell"]>;
export declare const orderStatusEnum: z.ZodEnum<["active", "completed", "cancelled"]>;
export declare const orderSchema: z.ZodObject<{
    _id: z.ZodString;
    platform: z.ZodEnum<["pc", "ps4", "xbox", "switch"]>;
    item_id: z.ZodString;
    player_id: z.ZodString;
    order_type: z.ZodEnum<["buy", "sell"]>;
    platinum: z.ZodNumber;
    quantity: z.ZodNumber;
    status: z.ZodEnum<["active", "completed", "cancelled"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    _id: string;
    status: "active" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    platform: "pc" | "ps4" | "xbox" | "switch";
    item_id: string;
    player_id: string;
    order_type: "buy" | "sell";
    platinum: number;
    quantity: number;
}, {
    _id: string;
    status: "active" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    platform: "pc" | "ps4" | "xbox" | "switch";
    item_id: string;
    player_id: string;
    order_type: "buy" | "sell";
    platinum: number;
    quantity: number;
}>;
export type Order = z.infer<typeof orderSchema>;
export declare const createOrderSchema: z.ZodObject<{
    platform: z.ZodEnum<["pc", "ps4", "xbox", "switch"]>;
    item_id: z.ZodString;
    order_type: z.ZodEnum<["buy", "sell"]>;
    platinum: z.ZodNumber;
    quantity: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    platform: "pc" | "ps4" | "xbox" | "switch";
    item_id: string;
    order_type: "buy" | "sell";
    platinum: number;
    quantity: number;
}, {
    platform: "pc" | "ps4" | "xbox" | "switch";
    item_id: string;
    order_type: "buy" | "sell";
    platinum: number;
    quantity?: number | undefined;
}>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
//# sourceMappingURL=order.d.ts.map