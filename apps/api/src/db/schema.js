import { getDB } from "./client";
export async function ensureSchema() {
    const db = await getDB();
    await db.collection("ratings").createIndex({ rater_id: 1, rated_id: 1 }, { unique: true, name: "uniq_rater_rated" });
    await db.collection("orders").createIndex({ player_id: 1, status: 1 }, { name: "player_orders" });
    await db.collection("transactions").createIndex({ seller_id: 1 }, { name: "seller_tx" });
    await db.collection("transactions").createIndex({ buyer_id: 1 }, { name: "buyer_tx" });
}
//# sourceMappingURL=schema.js.map