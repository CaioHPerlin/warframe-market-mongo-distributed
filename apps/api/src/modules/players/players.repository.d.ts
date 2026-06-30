import type { Player } from "@warframe/shared";
type PlayerDoc = Omit<Player, "_id">;
export declare class PlayersRepository {
    findById(id: string): Promise<Player | null>;
    findByUsername(username: string): Promise<Player | null>;
    insert(doc: PlayerDoc): Promise<string>;
}
export {};
//# sourceMappingURL=players.repository.d.ts.map