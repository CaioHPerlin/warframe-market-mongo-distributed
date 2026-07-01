import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tooltip, TooltipTrigger, TooltipPortal, TooltipPositioner, TooltipPopup } from "../components/ui/tooltip";
import { WhisperButton } from "../components/WhisperButton";
import { OrderActionButtons } from "../components/OrderActionButtons";
import { PlatinumIcon } from "../components/PlatinumIcon";
import {
  ArrowLeftIcon,
  ClockIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  ThumbsUpIcon,
} from "lucide-react";

type Order = {
  _id: string;
  player_id: string;
  player_username: string;
  player_positive_rep: number;
  item_id: string;
  order_type: "buy" | "sell";
  platinum: number;
  quantity: number;
  platform: string;
  status: string;
  createdAt: string;
};

type Transaction = {
  _id: string;
  platinum: number;
  quantity: number;
  completedAt: string;
  seller_username: string;
  buyer_username: string;
  item_name?: string;
};

type PaginatedTransactions = {
  data: Transaction[];
  page: number;
  limit: number;
  pages: number;
  total: number;
};

export default function ItemDetailPage() {
  const { id } = useParams();
  const { player: currentPlayer } = useAuth();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txPages, setTxPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
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

  useEffect(() => {
    if (!id) return;
    api
      .get<PaginatedTransactions>(`/api/transactions?item_id=${id}&page=${txPage}&limit=20`)
      .then((res) => {
        setTransactions(res.data);
        setTxPages(res.pages);
      })
      .catch(() => {});
  }, [id, txPage]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-28" />
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
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
  const lastTransactionPrice = item.lastTransactionPrice as number | undefined;
  const sellOrders = orders.filter((o) => o.order_type === "sell");
  const buyOrders = orders.filter((o) => o.order_type === "buy");
  const lowestSell = sellOrders.length ? Math.min(...sellOrders.map((o) => o.platinum)) : null;
  const highestBuy = buyOrders.length ? Math.max(...buyOrders.map((o) => o.platinum)) : null;
  const displaySellPrice = lowestSell ?? lastTransactionPrice ?? null;
  const isPriceFromTx = lowestSell == null && lastTransactionPrice != null;

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground transition-colors">
        <ArrowLeftIcon className="size-4" />
        Back to items
      </Link>

      <div className="flex items-start gap-5">
        {thumb && (
          <img src={thumb} alt="" className="size-20 rounded-xl bg-muted/30 object-contain shrink-0" />
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-heading font-bold tracking-tight">{itemName}</h1>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <TrendingDownIcon className="size-6 text-success" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Lowest sell</p>
                {isPriceFromTx && (
                  <Tooltip>
                    <TooltipTrigger>
                      <ClockIcon className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipPositioner>
                        <TooltipPopup>
                          Price sourced from recent transaction data — no active sell orders available.
                        </TooltipPopup>
                      </TooltipPositioner>
                    </TooltipPortal>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <PlatinumIcon className="size-6 text-gold" />
                <span className="text-2xl font-bold text-gold">
                  {displaySellPrice != null ? displaySellPrice : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <TrendingUpIcon className="size-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Highest buy</p>
              <div className="flex items-center gap-1.5 mt-1">
                <PlatinumIcon className="size-6 text-gold" />
                <span className="text-2xl font-bold text-gold">
                  {highestBuy != null ? highestBuy : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold">Sell Orders ({sellOrders.length})</h2>
          <Button size="default" render={<Link to={`/orders/new?item_id=${id}`} />}>
            <ShoppingCartIcon className="size-4" />
            Place Order
          </Button>
        </div>
        {sellOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No sell orders yet.</p>
        ) : (
          <OrdersTable orders={sellOrders} itemName={itemName} currentPlayer={currentPlayer} onOrdersChange={setOrders} />
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold">Buy Orders ({buyOrders.length})</h2>
        {buyOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No buy orders yet.</p>
        ) : (
          <OrdersTable orders={buyOrders} itemName={itemName} currentPlayer={currentPlayer} onOrdersChange={setOrders} />
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold">Price History ({transactions.length})</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No transaction history yet.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[18%] text-right">Platinum</TableHead>
                  <TableHead className="w-[8%] text-right">Qty</TableHead>
                  <TableHead className="w-[28%]">Seller</TableHead>
                  <TableHead className="w-[28%]">Buyer</TableHead>
                  <TableHead className="w-[18%]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-gold">
                        <PlatinumIcon className="size-4" />
                        {tx.platinum}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{tx.quantity}</TableCell>
                    <TableCell>
                      <Link to={`/players/${tx.seller_username}`} className="no-underline text-foreground hover:text-primary transition-colors">
                        {tx.seller_username}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/players/${tx.buyer_username}`} className="no-underline text-foreground hover:text-primary transition-colors">
                        {tx.buyer_username}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(tx.completedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {txPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {txPage} / {txPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage >= txPages}
                  onClick={() => setTxPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrdersTable({ orders, itemName, currentPlayer, onOrdersChange }: { orders: Order[]; itemName: string; currentPlayer?: { id: string } | null; onOrdersChange: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const removeOrder = (orderId: string) => {
    onOrdersChange((prev) => prev.filter((o) => o._id !== orderId));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[28%]">Player</TableHead>
          <TableHead className="w-[10%]">Rep</TableHead>
          <TableHead className="w-[18%] text-right">Platinum</TableHead>
          <TableHead className="w-[8%] text-right">Qty</TableHead>
          <TableHead className="w-[12%]">Platform</TableHead>
          <TableHead className="w-[24%] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o._id}>
            <TableCell>
              <Link to={`/players/${o.player_username}`} className="no-underline text-foreground hover:text-primary transition-colors">
                {o.player_username}
              </Link>
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center gap-0.5 text-xs ${o.player_positive_rep > 0 ? "text-success" : "text-muted-foreground"}`}>
                <ThumbsUpIcon className="size-3.5" />
                {o.player_positive_rep}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <span className="inline-flex items-center gap-1 font-semibold text-gold">
                <PlatinumIcon className="size-4" />
                {o.platinum}
              </span>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">{o.quantity}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">{o.platform.toUpperCase()}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {currentPlayer && o.player_id === currentPlayer.id ? (
                <OrderActionButtons
                  orderId={o._id}
                  itemName={itemName}
                  onDelete={() => removeOrder(o._id)}
                  onComplete={() => removeOrder(o._id)}
                />
              ) : (
                <WhisperButton
                  username={o.player_username}
                  itemName={itemName}
                  orderType={o.order_type}
                  platinum={o.platinum}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
