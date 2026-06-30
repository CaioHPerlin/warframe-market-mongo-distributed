import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

type Order = {
  _id: string;
  player_id: string;
  order_type: "buy" | "sell";
  platinum: number;
  quantity: number;
  platform: string;
  status: string;
  createdAt: string;
};

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Record<string, unknown>>(`/api/items/${id}`),
      api.get<Order[]>(`/api/orders?item_id=${id}`),
    ])
      .then(([itemData, ordersData]) => {
        setItem(itemData);
        setOrders(ordersData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-warframe-muted">Loading...</p>;
  if (!item) return <p className="text-warframe-red">Item not found</p>;

  const sellOrders = orders.filter((o) => o.order_type === "sell");
  const buyOrders = orders.filter((o) => o.order_type === "buy");

  return (
    <div>
      <Link to="/" className="text-sm text-warframe-muted no-underline hover:text-warframe-accent">&larr; Back to items</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{item.item_name as string}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Sell Orders</h2>
          {sellOrders.length === 0 ? (
            <p className="text-warframe-muted text-sm">No sell orders.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sellOrders.map((o) => (
                <OrderCard key={o._id} order={o} />
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Buy Orders</h2>
          {buyOrders.length === 0 ? (
            <p className="text-warframe-muted text-sm">No buy orders.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {buyOrders.map((o) => (
                <OrderCard key={o._id} order={o} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/orders/new?item_id=${id}`}
          className="inline-block bg-warframe-accent text-white rounded px-4 py-2 text-sm hover:opacity-90 no-underline"
        >
          Place Order
        </Link>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="border border-warframe-border bg-warframe-surface rounded p-3">
      <div className="flex items-center justify-between">
        <span className="text-warframe-gold font-medium">{order.platinum} platinum</span>
        <span className="text-sm text-warframe-muted">x{order.quantity}</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-sm">
        <Link to={`/players/${order.player_id}`} className="text-warframe-accent no-underline hover:underline">
          Seller
        </Link>
        <span className="text-warframe-muted">{order.platform.toUpperCase()}</span>
      </div>
    </div>
  );
}
