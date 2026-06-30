import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
export class PlayersRepository {
    async findById(id) {
        const db = await getDB();
        const doc = await db.collection("players").findOne({ _id: new ObjectId(id) });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
    }
    async findByUsername(username) {
        const db = await getDB();
        const doc = await db.collection("players").findOne({ username });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
    }
    async insert(doc) {
        const db = await getDB();
        const result = await db.collection("players").insertOne(doc);
        return result.insertedId.toString();
    }
}
//# sourceMappingURL=players.repository.js.map