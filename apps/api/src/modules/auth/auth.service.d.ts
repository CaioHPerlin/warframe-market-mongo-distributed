import type { LoginInput, RegisterInput } from "@warframe/shared";
import { PlayersService } from "../players/players.service";
export type AuthResult = {
    id: string;
    username: string;
    platform: string;
    token: string;
};
export declare class AuthService {
    private playersService;
    constructor(playersService: PlayersService);
    register(input: RegisterInput): Promise<AuthResult>;
    login(input: LoginInput): Promise<AuthResult>;
    findById(id: string): Promise<{
        _id: string;
        createdAt: string;
        username: string;
        password_hash: string;
        platform: "pc" | "ps4" | "xbox" | "switch";
    } | null>;
}
//# sourceMappingURL=auth.service.d.ts.map