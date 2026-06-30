# warframe-market-mongo-distributed

A simple simulation of the Warframe Market domain running on a distributed MongoDB cluster featuring a sharded architecture with Replica Sets, Docker Compose, and seed data from the real (and beloved) warframe.market website.

## Topology

> **@TODO**

**Total: 13 containers**: 3 Config Servers + 9 shard nodes (3 per shard) + 1 mongos router

## Getting Started

```bash
docker compose up -d
```

The `init-cluster` container runs automatically to initialize the Replica Sets, register the shards, and enable sharding on the collections.

Wait approximately **30 seconds**, then connect to the cluster:

```bash
mongosh --port 27017
```

## Inspecting the Cluster

```bash
# Complete cluster status: shards, chunks, and sharded collections
sh.status()

# Display the shard map
mongosh --port 27017 --eval "
  db.adminCommand({ getShardMap: 1 })
"

# Connect directly to Shard 1 and inspect its Replica Set
mongosh --host localhost --port 27018
rs.status()
```

## Collections and Shard Keys

Each shard key was chosen according to MongoDB's sharding recommendations and best practices. The primary criterion applied across all collections is **cardinality**: sharding performs best on high-cardinality fields, while low-cardinality keys limit the number of possible chunks to the number of distinct field values.

| Collection     | Shard Key                         | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`        | `{ _id: "hashed" }`               | The catalog is primarily queried by specific IDs, with no range query pattern. A hashed `_id` provides maximum cardinality and allows MongoDB to distribute chunks evenly across shards from the moment the collection is created, without waiting for chunk splits triggered by data growth.                                                                                                                                            |
| `players`      | `{ _id: "hashed" }`               | Follows the same reasoning as `items`: maximum cardinality through `_id`, with no range queries over players. The inability to perform targeted range queries on hashed keys is irrelevant because such queries do not exist in this domain. Player reputation is computed from the `ratings` collection rather than stored in the document itself.                                                                                      |
| `orders`       | `{ platform: 1, item_id: 1 }`     | Using `platform` alone would produce very low cardinality (only four possible values: PC, PS4, Xbox, and Switch), limiting the cluster to at most four chunks. The compound key solves this by grouping logically by platform while using `item_id` to provide the cardinality required for efficient distribution. It also matches the domain's most common query: "active orders for item X on platform Y," enabling targeted routing. |
| `transactions` | `{ item_id: 1, completed_at: 1 }` | Avoids the ascending-key anti-pattern. Sharding solely on `completed_at` would direct all new inserts into the newest ("Max") chunk, creating a hotspot on a single shard while others remain underutilized. Placing `item_id` first spreads inserts across multiple chunks, while `completed_at` as the second field preserves efficient range queries for an item's price history over a given time period.                            |
| `ratings`      | Not sharded                       | Intentionally left unsharded. The write volume is naturally low (one rating per pair of players who have completed a transaction), so there is no read or write throughput bottleneck to justify sharding. Sharding this collection would simply create mostly idle chunks without providing meaningful performance benefits.                                                                                                            |

## Applied Design Patterns

### Computed Pattern

Player reputation is **not stored** as a persistent field. Instead, it is computed by aggregating the associated `positive` and `neutral` ratings from the `ratings` collection. This avoids inconsistencies between a stored reputation value and the underlying data.

### Two Collection Pattern

`orders` and `transactions` are modeled as separate collections because they have different lifecycles and query patterns. Orders exist only while they are active, whereas transactions are permanent records used for historical price analysis.

## Business Rule: Ratings

A player may rate another player **only once**, enforced by the uniqueness of the `(rater_id, rated_id)` pair. Ratings can be either `positive` or `neutral` and may include a textual comment.

This rule prevents abuse through duplicate ratings and justifies keeping `ratings` as its own collection rather than embedding them in `transactions`.

## Seed Data

```bash
# Coming soon: script that consumes the public Warframe.Market API
# GET https://api.warframe.market/v2/items
```
