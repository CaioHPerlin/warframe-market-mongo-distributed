import { MongoClient } from "mongodb";
const MONGO_URI = Bun.env.MONGO_URI || "mongodb://localhost:27017/wfmarket";
const client = new MongoClient(MONGO_URI);
async function fetchItems() {
    console.log("Fetching items from warframe.market API...");
    const res = await fetch("https://api.warframe.market/v2/items", {
        headers: { Accept: "application/json" },
    });
    if (!res.ok)
        throw new Error(`API responded with ${res.status}`);
    const json = await res.json();
    const items = json.data ?? [];
    console.log(`Fetched ${items.length} items`);
    return items;
}
async function seed() {
    await client.connect();
    const db = client.db("wfmarket");
    const col = db.collection("items");
    const items = await fetchItems();
    const docs = items.map((item) => ({
        item_name: item.i18n.en.name,
        url_name: item.slug,
        thumb: item.i18n.en.thumb ?? null,
        tags: item.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));
    if (docs.length === 0) {
        console.log("No items to seed");
        await client.close();
        return;
    }
    await col.deleteMany({});
    const result = await col.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} items into wfmarket.items`);
    const testPlayer = await db.collection("players").findOne({});
    if (!testPlayer) {
        console.log("Seeding sample players...");
        const players = [
            {
                username: "tenno_one",
                password_hash: "$2a$10$dummy",
                platform: "pc",
                createdAt: new Date().toISOString(),
            },
            {
                username: "tenno_two",
                password_hash: "$2a$10$dummy",
                platform: "pc",
                createdAt: new Date().toISOString(),
            },
        ];
        await db.collection("players").insertMany(players);
        console.log("Inserted sample players");
    }
    await client.close();
    console.log("Seed complete");
}
seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map