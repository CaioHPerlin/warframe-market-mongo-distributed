import { z } from "zod";
export declare const ratingValueEnum: z.ZodEnum<["positive", "neutral"]>;
export declare const ratingSchema: z.ZodObject<{
    _id: z.ZodString;
    rater_id: z.ZodString;
    rated_id: z.ZodString;
    rating: z.ZodEnum<["positive", "neutral"]>;
    comment: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    _id: string;
    createdAt: string;
    rater_id: string;
    rated_id: string;
    rating: "positive" | "neutral";
    comment?: string | undefined;
}, {
    _id: string;
    createdAt: string;
    rater_id: string;
    rated_id: string;
    rating: "positive" | "neutral";
    comment?: string | undefined;
}>;
export type Rating = z.infer<typeof ratingSchema>;
export declare const createRatingSchema: z.ZodObject<{
    rated_id: z.ZodString;
    rating: z.ZodEnum<["positive", "neutral"]>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rated_id: string;
    rating: "positive" | "neutral";
    comment?: string | undefined;
}, {
    rated_id: string;
    rating: "positive" | "neutral";
    comment?: string | undefined;
}>;
export type CreateRating = z.infer<typeof createRatingSchema>;
//# sourceMappingURL=rating.d.ts.map