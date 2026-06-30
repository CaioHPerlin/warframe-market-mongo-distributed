export type JwtPayload = {
    sub: string;
    username: string;
    iat: number;
    exp: number;
};
export declare function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string>;
export declare function verifyToken(token: string): Promise<JwtPayload | null>;
//# sourceMappingURL=jwt.d.ts.map