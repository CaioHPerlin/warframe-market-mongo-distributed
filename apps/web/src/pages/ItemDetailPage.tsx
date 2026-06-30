import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { WhisperButton } from "../components/WhisperButton";

type Order = {
  _id: string;
  player_id: string;
  player_username: string;
  item_id: string;
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!item) return <p className="text-destructive text-center py-12">Item not found</p>;

  const itemName = item.item_name as string;
  const sellOrders = orders.filter((o) => o.order_type === "sell");
  const buyOrders = orders.filter((o) => o.order_type === "buy");

  return (
    <div>
      <Link to="/" className="text-sm text-muted-foreground no-underline hover:text-foreground">&larr; Back to items</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{itemName}</h1>

      <Tabs defaultValue="sell">
        <TabsList>
          <TabsTrigger value="sell">Sell Orders ({sellOrders.length})</TabsTrigger>
          <TabsTrigger value="buy">Buy Orders ({buyOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="sell" className="mt-4">
          {sellOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sell orders.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sellOrders.map((o) => (
                <OrderCard key={o._id} order={o} itemName={itemName} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="buy" className="mt-4">
          {buyOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No buy orders.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {buyOrders.map((o) => (
                <OrderCard key={o._id} order={o} itemName={itemName} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button asChild>
          <Link to={`/orders/new?item_id=${id}`}>Place Order</Link>
        </Button>
      </div>
    </div>
  );
}

function OrderCard({ order, itemName }: { order: Order; itemName: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-4 pt-(--card-spacing)">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-gold font-medium shrink-0">{order.platinum}p</span>
          <span className="text-muted-foreground text-xs shrink-0">x{order.quantity}</span>
          <Badge variant="outline" className="text-[10px]">{order.platform.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/players/${order.player_id}`}
            className="text-xs text-muted-foreground no-underline hover:text-foreground"
          >
            {order.player_username}
          </Link>
          <WhisperButton
            username={order.player_username}
            itemName={itemName}
            orderType={order.order_type}
            platinum={order.platinum}
          />
        </div>
      </CardContent>
    </Card>
  );
}
