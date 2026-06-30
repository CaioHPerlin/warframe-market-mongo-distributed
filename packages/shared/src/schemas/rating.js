import { z } from "zod";
export const ratingValueEnum = z.enum(["positive", "neutral"]);
export const ratingSchema = z.object({
    _id: z.string(),
    rater_id: z.string(),
    rated_id: z.string(),
    rating: ratingValueEnum,
    comment: z.string().max(500).optional(),
    createdAt: z.string().datetime(),
});
export const createRatingSchema = z.object({
    rated_id: z.string(),
    rating: ratingValueEnum,
    comment: z.string().max(500).optional(),
});
//# sourceMappingURL=rating.js.map