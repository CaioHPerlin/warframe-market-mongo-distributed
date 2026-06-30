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

export type Item = z.infer<typeof itemSchema>;

export const createItemSchema = itemSchema.omit({ _id: true });
export type CreateItem = z.infer<typeof createItemSchema>;
