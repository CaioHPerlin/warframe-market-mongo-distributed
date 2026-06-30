import { getDB } from "../../db/client";
export class RatingsRepository {
    async findByRatedId(ratedId) {
        const db = await getDB();
        const docs = await db.collection("ratings").find({ rated_id: ratedId }).sort({ createdAt: -1 }).limit(100).toArray();
        return docs.map((d) => ({ ...d, _id: d._id.toString() }));
    }
    async findByRaterAndRated(raterId, ratedId) {
        const db = await getDB();
        const doc = await db.collection("ratings").findOne({ rater_id: raterId, rated_id: ratedId });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
    }
    async insert(doc) {
        const db = await getDB();
        const result = await db.collection("ratings").insertOne(doc);
        return { ...doc, _id: result.insertedId.toString() };
    }
    async getReputation(playerId) {
        const db = await getDB();
        const agg = await db
            .collection("ratings")
            .aggregate([
            { $match: { rated_id: playerId } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
        ])
            .toArray();
        const reputation = {};
        for (const r of agg)
            reputation[r._id] = r.count;
        return reputation;
    }
}
//# sourceMappingURL=ratings.repository.js.map