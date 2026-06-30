import { z } from "zod";
export const itemSchema = z.object({
    _id: z.string(),
    item_name: z.string(),
    url_name: z.string(),
    thumb: z.string().optional(),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
export const createItemSchema = itemSchema.omit({ _id: true });
//# sourceMappingURL=item.js.map