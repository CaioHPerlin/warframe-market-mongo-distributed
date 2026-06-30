import { getDB } from "../../db/client";
export class TransactionsRepository {
    async find(filter) {
        const db = await getDB();
        const docs = await db.collection("transactions").find(filter).sort({ completedAt: -1 }).limit(100).toArray();
        return docs.map((d) => ({ ...d, _id: d._id.toString() }));
    }
    async insert(doc) {
        const db = await getDB();
        const result = await db.collection("transactions").insertOne(doc);
        return { ...doc, _id: result.insertedId.toString() };
    }
}
//# sourceMappingURL=transactions.repository.js.map