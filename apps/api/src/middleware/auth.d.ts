import type { Context, Next } from "hono";
import { type JwtPayload } from "../lib/jwt";
declare module "hono" {
    interface ContextVariableMap {
        player: JwtPayload;
    }
}
export declare function authMiddleware(c: Context, next: Next): Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">) | undefined>;
export declare function optionalAuthMiddleware(c: Context, next: Next): Promise<void>;
//# sourceMappingURL=auth.d.ts.map