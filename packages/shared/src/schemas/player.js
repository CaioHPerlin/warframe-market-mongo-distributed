import { z } from "zod";
export const platformEnum = z.enum(["pc", "ps4", "xbox", "switch"]);
export const playerSchema = z.object({
    _id: z.string(),
    username: z.string().min(3).max(24),
    password_hash: z.string(),
    platform: platformEnum,
    createdAt: z.string().datetime(),
});
export const registerSchema = z.object({
    username: z.string().min(3).max(24),
    password: z.string().min(6).max(128),
    platform: platformEnum,
});
export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});
//# sourceMappingURL=player.js.map