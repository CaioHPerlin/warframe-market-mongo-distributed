import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { WhisperButton } from "../components/WhisperButton";
import { ArrowLeftIcon, ShoppingCartIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

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
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!item) return (
    <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
      <p className="text-lg">Item not found</p>
      <Button variant="outline" render={<Link to="/" />}>Back to items</Button>
    </div>
  );

  const itemName = item.item_name as string;
  const tags = (item.tags as string[]) ?? [];
  const thumb = item.thumb as string | undefined;
  const sellOrders = orders.filter((o) => o.order_type === "sell");
  const buyOrders = orders.filter((o) => o.order_type === "buy");
  const lowestSell = sellOrders.length ? Math.min(...sellOrders.map((o) => o.platinum)) : null;
  const highestBuy = buyOrders.length ? Math.max(...buyOrders.map((o) => o.platinum)) : null;

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground transition-colors">
        <ArrowLeftIcon className="size-3.5" />
        Back to items
      </Link>

      <div className="flex items-start gap-4">
        {thumb && (
          <img src={thumb} alt="" className="size-16 rounded-xl bg-muted/50 object-contain shrink-0" />
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-heading font-bold tracking-tight">{itemName}</h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-(--card-spacing)">
            <TrendingDownIcon className="size-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Lowest sell</p>
              <p className="text-lg font-bold text-success">
                {lowestSell != null ? `${lowestSell}p` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-(--card-spacing)">
            <TrendingUpIcon className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Highest buy</p>
              <p className="text-lg font-bold text-primary">
                {highestBuy != null ? `${highestBuy}p` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Sell Orders ({sellOrders.length})</h2>
          <Button size="sm" render={<Link to={`/orders/new?item_id=${id}`} />}>
            <ShoppingCartIcon className="size-3.5" />
            Place Order
          </Button>
        </div>
        {sellOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No sell orders yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sellOrders.map((o) => (
              <OrderCard key={o._id} order={o} itemName={itemName} />
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold">Buy Orders ({buyOrders.length})</h2>
        {buyOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No buy orders yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {buyOrders.map((o) => (
              <OrderCard key={o._id} order={o} itemName={itemName} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, itemName }: { order: Order; itemName: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-4 pt-(--card-spacing)">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg font-bold text-gold shrink-0">{order.platinum}<span className="text-sm text-muted-foreground font-normal">p</span></span>
          <span className="text-xs text-muted-foreground shrink-0">x{order.quantity}</span>
          <Badge variant="outline" className="text-[10px] leading-none">{order.platform.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/players/${order.player_id}`}
            className="text-xs text-muted-foreground no-underline hover:text-foreground transition-colors"
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
