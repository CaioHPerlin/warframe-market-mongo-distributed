import { MongoClient } from "mongodb";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wfmarket";
const DB_NAME = "wfmarket";
let client;
export async function getClient() {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    return client;
}
export async function getDB() {
    const c = await getClient();
    return c.db(DB_NAME);
}
//# sourceMappingURL=client.js.map