import { getDB } from "./client";

export async function ensureSchema() {
  const db = await getDB();

  try {
    await db.collection("ratings").dropIndex("uniq_rater_rated");
  } catch {
    // index didn't exist, that's fine
  }

  await db.collection("ratings").createIndex(
    { rated_id: 1, rater_id: 1 },
    { unique: true, name: "uniq_rater_rated" },
  );

  await db.collection("orders").createIndex(
    { player_id: 1, status: 1 },
    { name: "player_orders" },
  );

  await db.collection("orders").createIndex(
    { item_id: 1, status: 1, order_type: 1 },
    { name: "item_prices" },
  );

  await db.collection("transactions").createIndex(
    { seller_id: 1 },
    { name: "seller_tx" },
  );

  await db.collection("transactions").createIndex(
    { buyer_id: 1 },
    { name: "buyer_tx" },
  );
}
