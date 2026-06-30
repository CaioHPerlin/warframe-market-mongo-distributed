import { z } from "zod";
export declare const platformEnum: z.ZodEnum<["pc", "ps4", "xbox", "switch"]>;
export declare const playerSchema: z.ZodObject<{
    _id: z.ZodString;
    username: z.ZodString;
    password_hash: z.ZodString;
    platform: z.ZodEnum<["pc", "ps4", "xbox", "switch"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    _id: string;
    createdAt: string;
    username: string;
    password_hash: string;
    platform: "pc" | "ps4" | "xbox" | "switch";
}, {
    _id: string;
    createdAt: string;
    username: string;
    password_hash: string;
    platform: "pc" | "ps4" | "xbox" | "switch";
}>;
export type Player = z.infer<typeof playerSchema>;
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    platform: z.ZodEnum<["pc", "ps4", "xbox", "switch"]>;
}, "strip", z.ZodTypeAny, {
    username: string;
    platform: "pc" | "ps4" | "xbox" | "switch";
    password: string;
}, {
    username: string;
    platform: "pc" | "ps4" | "xbox" | "switch";
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=player.d.ts.map