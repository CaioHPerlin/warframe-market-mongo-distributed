import bcrypt from "bcryptjs";
import { signToken } from "../../lib/jwt";
export class AuthService {
    playersService;
    constructor(playersService) {
        this.playersService = playersService;
    }
    async register(input) {
        const existing = await this.playersService.findByUsername(input.username);
        if (existing)
            throw new Error("Username taken");
        const password_hash = await bcrypt.hash(input.password, 10);
        const id = await this.playersService.create({
            username: input.username,
            password_hash,
            platform: input.platform,
            createdAt: new Date().toISOString(),
        });
        const token = await signToken({ sub: id, username: input.username });
        return { id, username: input.username, platform: input.platform, token };
    }
    async login(input) {
        const player = await this.playersService.findByUsername(input.username);
        if (!player)
            throw new Error("Invalid credentials");
        const valid = await bcrypt.compare(input.password, player.password_hash);
        if (!valid)
            throw new Error("Invalid credentials");
        const token = await signToken({
            sub: player._id,
            username: player.username,
        });
        return {
            id: player._id,
            username: player.username,
            platform: player.platform,
            token,
        };
    }
    async findById(id) {
        return this.playersService.findById(id);
    }
}
//# sourceMappingURL=auth.service.js.map