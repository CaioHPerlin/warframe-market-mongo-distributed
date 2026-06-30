import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
export class ItemsRepository {
    async findAll(search) {
        const db = await getDB();
        const filter = {};
        if (search)
            filter.item_name = { $regex: search, $options: "i" };
        const docs = await db.collection("items").find(filter).limit(100).toArray();
        return docs.map((d) => ({ ...d, _id: d._id.toString() }));
    }
    async findById(id) {
        const db = await getDB();
        const doc = await db.collection("items").findOne({ _id: new ObjectId(id) });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
    }
    async insertMany(items) {
        const db = await getDB();
        const result = await db.collection("items").insertMany(items);
        return result.insertedCount;
    }
}
//# sourceMappingURL=items.repository.js.map