import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { OrderActionButtons } from "../components/OrderActionButtons";
import { PlatinumIcon } from "../components/PlatinumIcon";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button, buttonVariants } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { WhisperButton } from "../components/WhisperButton";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";

type Rating = {
  _id: string;
  rater_id: string;
  rated_id: string;
  rating: "positive" | "negative" | "neutral";
  comment?: string;
  createdAt: string;
};

type Order = {
  _id: string;
  item_id: string;
  item_name: string;
  order_type: "buy" | "sell";
  player_id?: string;
  platinum: number;
  quantity: number;
  status: string;
  createdAt: string;
};

type Transaction = {
  _id: string;
  item_id: string;
  order_id: string;
  seller_id: string;
  buyer_id: string;
  item_name: string;
  seller_username: string;
  buyer_username: string;
  platinum: number;
  quantity: number;
  completedAt: string;
};

type PaginatedOrders = {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const ORDER_TYPES = ["sell", "buy"] as const;
const ORDERS_PER_PAGE = 10;

export default function PlayerPage() {
  const { id } = useParams();
  const { player: currentPlayer } = useAuth();
  const [player, setPlayer] = useState<Record<string, unknown> | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(0);
  const [ordersType, setOrdersType] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    api
      .get<Record<string, unknown>>(`/api/players/${id}`)
      .then((p) => {
        if (cancelled) return;
        setPlayer(p);
        const playerId = p.id as string;

        api
          .get<Rating[]>(`/api/ratings?player_id=${playerId}`)
          .then((r) => {
            if (!cancelled) setRatings(r);
          })
          .catch(() => {});

        api
          .get<Transaction[]>(`/api/transactions?player_id=${playerId}`)
          .then((t) => {
            if (!cancelled) setTransactions(t);
          })
          .catch(() => {});

        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!player) return;
    const playerId = player.id as string;
    let cancelled = false;

    const params = new URLSearchParams({
      player_id: playerId,
      page: String(ordersPage),
      limit: String(ORDERS_PER_PAGE),
    });
    if (ordersType) params.set("order_type", ordersType);

    api
      .get<PaginatedOrders>(`/api/orders?${params}`)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
        setOrdersTotal(res.total);
        setOrdersPages(res.pages);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [player, ordersPage, ordersType]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-5 w-28" />
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!player)
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <p className="text-lg">Player not found</p>
        <Link to="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to items
        </Link>
      </div>
    );

  const username = player.username as string;
  const platform = player.platform as string;
  const rep = player.reputation as Record<string, number> | undefined;
  const positive = rep?.positive ?? 0;
  const neutral = rep?.neutral ?? 0;
  const totalRep = positive + neutral;
  const repPct = totalRep > 0 ? Math.round((positive / totalRep) * 100) : 0;
  const playerId = player.id as string;
  const isOwnProfile = currentPlayer?.username === username;

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>

      <div className="flex items-start gap-5">
        <Avatar className="size-20">
          <AvatarFallback className="text-2xl bg-muted">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            {username}
          </h1>
          <Badge variant="outline" className="mt-2">
            {platform.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <StarIcon className="size-5 text-amber-400" />
              Reputation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ThumbsUpIcon className="size-5 text-success" />
                <span className="text-lg font-semibold text-success">
                  {positive}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-5 flex items-center justify-center text-muted-foreground text-lg font-bold">
                  •
                </span>
                <span className="text-lg font-semibold text-muted-foreground">
                  {neutral}
                </span>
              </div>
            </div>

            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${repPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRep > 0
                ? `${repPct}% positive (${totalRep} total)`
                : "No ratings yet"}
            </p>
          </CardContent>
        </Card>

        {currentPlayer && !isOwnProfile && (
          <RatePlayerCard
            playerId={playerId}
            username={username}
            onSubmitted={(r) => {
              setRatings((prev) => [r, ...prev]);
              setPlayer((prev) => {
                if (!prev) return prev;
                const rep: Record<string, number> = (prev.reputation as Record<
                  string,
                  number
                >) ?? { positive: 0, neutral: 0 };
                const key = r.rating === "positive" ? "positive" : "neutral";
                return { ...prev, reputation: { ...rep, [key]: (rep[key] ?? 0) + 1 } };
              });
            }}
          />
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold">
            Ratings ({ratings.length})
          </h2>
          {ratings.length === 0 ? (
            <p className="text-sm text-muted-foreground pb-6 pt-15 text-center">
              No ratings received.
            </p>
          ) : (
            <div className="space-y-3">
              {ratings.map((r) => (
                <Card key={r._id}>
                  <CardContent className="flex items-start gap-4">
                    <span
                      className={`text-lg font-bold shrink-0 ${r.rating === "positive" ? "text-success" : "text-muted-foreground"}`}
                    >
                      {r.rating === "positive" ? "+" : "•"}
                    </span>
                    <div className="min-w-0">
                      {r.comment && <p className="text-sm">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold">
            Active Orders ({ordersTotal})
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {ORDER_TYPES.map((t) => (
              <Badge
                key={t}
                variant={ordersType === t ? "default" : "secondary"}
                className="cursor-pointer select-none transition-colors text-xs px-3 py-1.5 capitalize"
                onClick={() => setOrdersType(ordersType === t ? null : t)}
              >
                {t}
              </Badge>
            ))}
            {ordersType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOrdersType(null)}
                className="text-muted-foreground gap-1 h-6 text-xs px-2"
              >
                Clear
              </Button>
            )}
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No active orders.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Type</TableHead>
                    <TableHead className="w-[15%] text-right">
                      Platinum
                    </TableHead>
                    <TableHead className="w-[10%] text-right">Qty</TableHead>
                    <TableHead className="w-[35%]">Item</TableHead>
                    <TableHead className="w-[25%] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell>
                        <Badge
                          variant={
                            o.order_type === "sell" ? "default" : "secondary"
                          }
                        >
                          {o.order_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-gold">
                          <PlatinumIcon className="size-4" />
                          {o.platinum}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {o.quantity}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/items/${o.item_id}`}
                          className="text-link hover:underline text-sm font-medium"
                        >
                          {o.item_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {currentPlayer && o.player_id === currentPlayer.id ? (
                          <OrderActionButtons
                            orderId={o._id}
                            itemName={o.item_name}
                            onComplete={() =>
                              setOrders((prev) =>
                                prev.filter((x) => x._id !== o._id),
                              )
                            }
                            onDelete={() =>
                              setOrders((prev) =>
                                prev.filter((x) => x._id !== o._id),
                              )
                            }
                          />
                        ) : (
                          <WhisperButton
                            username={username}
                            itemName={o.item_name}
                            orderType={o.order_type}
                            platinum={o.platinum}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {ordersPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage <= 1}
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeftIcon className="size-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {ordersPage} / {ordersPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ordersPage >= ordersPages}
                    onClick={() => setOrdersPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold">
          Transaction History ({transactions.length})
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No transactions yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%]">Type</TableHead>
                <TableHead className="w-[15%] text-right">Platinum</TableHead>
                <TableHead className="w-[10%] text-right">Qty</TableHead>
                <TableHead className="w-[30%]">Item</TableHead>
                <TableHead className="w-[15%]">With</TableHead>
                <TableHead className="w-[15%] text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const isSeller = t.seller_id === playerId;
                return (
                  <TableRow key={t._id}>
                    <TableCell>
                      <Badge variant={isSeller ? "default" : "secondary"}>
                        {isSeller ? "sell" : "buy"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-gold">
                        <PlatinumIcon className="size-4" />
                        {t.platinum}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {t.quantity}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/items/${t.item_id}`}
                        className="text-link hover:underline text-sm font-medium"
                      >
                        {t.item_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link
                        to={`/players/${isSeller ? t.buyer_username : t.seller_username}`}
                        className="text-link hover:underline"
                      >
                        {isSeller ? t.buyer_username : t.seller_username}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(t.completedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function RatePlayerCard({
  playerId,
  username,
  onSubmitted,
}: {
  playerId: string;
  username: string;
  onSubmitted: (rating: Rating) => void;
}) {
  const [rating, setRating] = useState<"positive" | "neutral" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const r = await api.post<Rating>("/api/ratings", {
        rated_id: playerId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(`Rated ${username} as ${rating}`);
      onSubmitted(r);
      setRating(null);
      setComment("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit rating";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <StarIcon className="size-4 text-amber-400" />
          Rate {username}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant={rating === "positive" ? "default" : "outline"}
            size="sm"
            onClick={() => setRating("positive")}
            className="gap-1.5"
          >
            <ThumbsUpIcon className="size-4" />
            Positive
          </Button>
          <Button
            variant={rating === "neutral" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setRating("neutral")}
            className="gap-1.5"
          >
            Neutral
          </Button>
        </div>
        <input
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Add a comment or description..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {comment.length}/500
        </p>
        <Button
          disabled={!rating || submitting}
          onClick={submit}
          className="w-full"
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </Button>
      </CardContent>
    </Card>
  );
}
