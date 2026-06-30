import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
export class OrdersRepository {
    async find(filter) {
        const db = await getDB();
        const docs = await db
            .collection("orders")
            .aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $limit: 100 },
            {
                $lookup: {
                    from: "players",
                    let: { pid: { $toObjectId: "$player_id" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$pid"] } } },
                    ],
                    as: "_player",
                },
            },
            { $unwind: { path: "$_player", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    player_username: "$_player.username",
                },
            },
            { $project: { _player: 0 } },
        ])
            .toArray();
        return docs.map((d) => ({ ...d, _id: d._id.toString(), player_username: d.player_username ?? "Unknown" }));
    }
    async findById(id) {
        const db = await getDB();
        const doc = await db.collection("orders").findOne({ _id: new ObjectId(id) });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
    }
    async insert(doc) {
        const db = await getDB();
        const result = await db.collection("orders").insertOne(doc);
        return { ...doc, _id: result.insertedId.toString() };
    }
    async update(id, doc) {
        const db = await getDB();
        await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: doc });
    }
}
//# sourceMappingURL=orders.repository.js.map