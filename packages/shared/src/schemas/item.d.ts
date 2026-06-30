import { z } from "zod";
export declare const itemSchema: z.ZodObject<{
    _id: z.ZodString;
    item_name: z.ZodString;
    url_name: z.ZodString;
    thumb: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    _id: string;
    item_name: string;
    url_name: string;
    tags: string[];
    thumb?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    _id: string;
    item_name: string;
    url_name: string;
    thumb?: string | undefined;
    tags?: string[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export type Item = z.infer<typeof itemSchema>;
export declare const createItemSchema: z.ZodObject<Omit<{
    _id: z.ZodString;
    item_name: z.ZodString;
    url_name: z.ZodString;
    thumb: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id">, "strip", z.ZodTypeAny, {
    item_name: string;
    url_name: string;
    tags: string[];
    thumb?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    item_name: string;
    url_name: string;
    thumb?: string | undefined;
    tags?: string[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export type CreateItem = z.infer<typeof createItemSchema>;
//# sourceMappingURL=item.d.ts.map