import { z } from "zod";
export declare const transactionSchema: z.ZodObject<{
    _id: z.ZodString;
    item_id: z.ZodString;
    order_id: z.ZodString;
    seller_id: z.ZodString;
    buyer_id: z.ZodString;
    platinum: z.ZodNumber;
    quantity: z.ZodNumber;
    completedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    _id: string;
    item_id: string;
    platinum: number;
    quantity: number;
    order_id: string;
    seller_id: string;
    buyer_id: string;
    completedAt: string;
}, {
    _id: string;
    item_id: string;
    platinum: number;
    quantity: number;
    order_id: string;
    seller_id: string;
    buyer_id: string;
    completedAt: string;
}>;
export type Transaction = z.infer<typeof transactionSchema>;
export declare const createTransactionSchema: z.ZodObject<{
    order_id: z.ZodString;
    buyer_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    buyer_id: string;
}, {
    order_id: string;
    buyer_id: string;
}>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
//# sourceMappingURL=transaction.d.ts.map