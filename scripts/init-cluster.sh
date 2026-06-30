#!/bin/bash

echo "Waiting for nodes to start..."
sleep 15

# 1. Configure Config Server Replica Set
echo "- Initializing Config Server Replica Set..."
mongosh --host configsvr1:27017 --eval "
rs.initiate({
  _id: 'configRS',
  configsvr: true,
  members: [
    { _id: 0, host: 'configsvr1:27017' },
    { _id: 1, host: 'configsvr2:27017' },
    { _id: 2, host: 'configsvr3:27017' }
  ]
})
"

sleep 5

# 2. Initialize Shard 1 Replica Set
echo "- Initializing Shard 1 Replica Set..."
mongosh --host shard1svr1:27017 --eval "
rs.initiate({
  _id: 'shard1RS',
  members: [
    { _id: 0, host: 'shard1svr1:27017' },
    { _id: 1, host: 'shard1svr2:27017' },
    { _id: 2, host: 'shard1svr3:27017' }
  ]
})
"

# 3. Initialize Shard 2 Replica Set
echo "- Initializing Shard 2 Replica Set..."
mongosh --host shard2svr1:27017 --eval "
rs.initiate({
  _id: 'shard2RS',
  members: [
    { _id: 0, host: 'shard2svr1:27017' },
    { _id: 1, host: 'shard2svr2:27017' },
    { _id: 2, host: 'shard2svr3:27017' }
  ]
})
"

# 4. Initialize Shard 3 Replica Set
echo "- Initializing Shard 3 Replica Set..."
mongosh --host shard3svr1:27017 --eval "
rs.initiate({
  _id: 'shard3RS',
  members: [
    { _id: 0, host: 'shard3svr1:27017' },
    { _id: 1, host: 'shard3svr2:27017' },
    { _id: 2, host: 'shard3svr3:27017' }
  ]
})
"

sleep 10

# 5. Register the shards with mongos
echo "- Registering shards with mongos..."
mongosh --host mongos:27017 --eval "
sh.addShard('shard1RS/shard1svr1:27017,shard1svr2:27017,shard1svr3:27017')
sh.addShard('shard2RS/shard2svr1:27017,shard2svr2:27017,shard2svr3:27017')
sh.addShard('shard3RS/shard3svr1:27017,shard3svr2:27017,shard3svr3:27017')
"

sleep 5

# 6. Enable sharding for the database and collections
echo "- Enabling sharding for collections..."
mongosh --host mongos:27017 --eval "
// Enable sharding for the database
sh.enableSharding('wfmarket')

// items — hashed on _id (uniform distribution, static catalog)
sh.shardCollection('wfmarket.items', { _id: 'hashed' })

// players — hashed on _id (uniform distribution, no dominant query pattern)
sh.shardCollection('wfmarket.players', { _id: 'hashed' })

// orders — compound key: platform + item_id
// Most common query: 'active orders for item X on platform Y' — targeted
sh.shardCollection('wfmarket.orders', { platform: 1, item_id: 1 })

// transactions — compound key: item_id + completed_at
// Most common query: 'price history for item X during period Y' — targeted
// Placing item_id first avoids timestamp hotspots
sh.shardCollection('wfmarket.transactions', { item_id: 1, completed_at: 1 })
"

echo "✅ Cluster successfully initialized."
echo ""
echo "Connect to mongos at: mongodb://localhost:27017"
echo "Inspect the cluster: mongosh --eval 'sh.status()'"