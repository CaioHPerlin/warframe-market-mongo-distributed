import { z } from "zod";
export const transactionSchema = z.object({
    _id: z.string(),
    item_id: z.string(),
    order_id: z.string(),
    seller_id: z.string(),
    buyer_id: z.string(),
    platinum: z.number().int().positive(),
    quantity: z.number().int().positive(),
    completedAt: z.string().datetime(),
});
export const createTransactionSchema = z.object({
    order_id: z.string(),
    buyer_id: z.string(),
});
//# sourceMappingURL=transaction.js.map