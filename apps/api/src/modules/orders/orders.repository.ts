import { ObjectId } from "mongodb";
import { getDB } from "../../db/client";
import type { Order } from "@warframe/shared";

type OrderDoc = Omit<Order, "_id" | "item_id" | "player_id"> & {
  item_id: ObjectId;
  player_id: ObjectId;
};

export type OrderWithPlayer = Order & { player_username: string; player_positive_rep: number; item_name: string };

export type FindOrdersOpts = {
  filter: Record<string, unknown>;
  page: number;
  limit: number;
};

export type PaginatedOrders = {
  data: OrderWithPlayer[];
  total: number;
};

function toOrder(doc: OrderDoc & { _id: ObjectId }): Order {
  return {
    ...doc,
    _id: doc._id.toString(),
    item_id: doc.item_id.toString(),
    player_id: doc.player_id.toString(),
  };
}

function toOrderWithPlayer(doc: Record<string, unknown>): OrderWithPlayer {
  return {
    _id: (doc._id as ObjectId).toString(),
    platform: doc.platform as "pc" | "ps4" | "xbox" | "switch",
    item_id: (doc.item_id as ObjectId).toString(),
    player_id: (doc.player_id as ObjectId).toString(),
    order_type: doc.order_type as "buy" | "sell",
    platinum: doc.platinum as number,
    quantity: doc.quantity as number,
    status: doc.status as "active" | "completed" | "cancelled",
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
    player_username: (doc.player_username as string) ?? "Unknown",
    player_positive_rep: (doc.player_positive_rep as number) ?? 0,
    item_name: (doc.item_name as string) ?? "Unknown",
  };
}

export class OrdersRepository {
  async findPaginated(opts: FindOrdersOpts): Promise<PaginatedOrders> {
    const db = await getDB();
    const { filter, page, limit } = opts;
    const skip = (page - 1) * limit;

    const mongoFilter: Record<string, unknown> = { ...filter };
    if (mongoFilter.item_id) mongoFilter.item_id = new ObjectId(mongoFilter.item_id as string);
    if (mongoFilter.player_id) mongoFilter.player_id = new ObjectId(mongoFilter.player_id as string);

    const pipeline = [
      { $match: mongoFilter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "players",
          localField: "player_id",
          foreignField: "_id",
          as: "_player",
        },
      },
      { $unwind: { path: "$_player", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "ratings",
          let: { pid: "$player_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$rated_id", "$$pid"] }, rating: "positive" } },
            { $count: "count" },
          ],
          as: "_reputation",
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "item_id",
          foreignField: "_id",
          as: "_item",
        },
      },
      { $unwind: { path: "$_item", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          player_username: "$_player.username",
          player_positive_rep: { $ifNull: [{ $arrayElemAt: ["$_reputation.count", 0] }, 0] },
          item_name: "$_item.item_name",
        },
      },
      { $project: { _player: 0, _reputation: 0, _item: 0 } },
    ];

    const [totalResult, aggregated] = await Promise.all([
      db.collection("orders").countDocuments(mongoFilter),
      db.collection("orders").aggregate([...pipeline, { $skip: skip }, { $limit: limit }]).toArray(),
    ]);

    return {
      data: aggregated.map(toOrderWithPlayer),
      total: totalResult,
    };
  }

  async find(filter: Record<string, unknown>): Promise<OrderWithPlayer[]> {
    const db = await getDB();

    const mongoFilter: Record<string, unknown> = { ...filter };
    if (mongoFilter.item_id) mongoFilter.item_id = new ObjectId(mongoFilter.item_id as string);
    if (mongoFilter.player_id) mongoFilter.player_id = new ObjectId(mongoFilter.player_id as string);

    const docs = await db
      .collection("orders")
      .aggregate([
        { $match: mongoFilter },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
        {
          $lookup: {
            from: "players",
            localField: "player_id",
            foreignField: "_id",
            as: "_player",
          },
        },
        { $unwind: { path: "$_player", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "ratings",
            let: { pid: "$player_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$rated_id", "$$pid"] }, rating: "positive" } },
              { $count: "count" },
            ],
            as: "_reputation",
          },
        },
        {
          $lookup: {
            from: "items",
            localField: "item_id",
            foreignField: "_id",
            as: "_item",
          },
        },
        { $unwind: { path: "$_item", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            player_username: "$_player.username",
            player_positive_rep: { $ifNull: [{ $arrayElemAt: ["$_reputation.count", 0] }, 0] },
            item_name: "$_item.item_name",
          },
        },
        { $project: { _player: 0, _reputation: 0, _item: 0 } },
      ])
      .toArray();
    return docs.map(toOrderWithPlayer);
  }

  async findById(id: string): Promise<Order | null> {
    const db = await getDB();
    const doc = await db.collection<OrderDoc>("orders").findOne({ _id: new ObjectId(id) });
    return doc ? toOrder(doc) : null;
  }

  async insert(doc: Omit<Order, "_id">): Promise<Order> {
    const db = await getDB();
    const result = await db.collection("orders").insertOne({
      ...doc,
      item_id: new ObjectId(doc.item_id),
      player_id: new ObjectId(doc.player_id),
    });
    return { ...doc, _id: result.insertedId.toString() };
  }

  async update(id: string, doc: Record<string, unknown>): Promise<void> {
    const db = await getDB();
    const updateDoc = { ...doc };
    if (updateDoc.item_id) updateDoc.item_id = new ObjectId(updateDoc.item_id as string);
    if (updateDoc.player_id) updateDoc.player_id = new ObjectId(updateDoc.player_id as string);
    await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
  }
}
