import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ThumbsUpIcon, ThumbsDownIcon, CalendarIcon, Gamepad2Icon } from "lucide-react";

type PlayerProfile = {
  id: string;
  username: string;
  platform: string;
  createdAt: string;
  reputation: Record<string, number>;
};

type Rating = {
  _id: string;
  rater_id: string;
  rater_username?: string;
  rated_id: string;
  rating_value: "positive" | "negative";
  comment?: string;
  createdAt: string;
};

type Order = {
  _id: string;
  item_id: string;
  order_type: "buy" | "sell";
  platinum: number;
  quantity: number;
  status: string;
  createdAt: string;
};

export default function PlayerPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<PlayerProfile>(`/api/players/${id}`),
      api.get<Rating[]>(`/api/ratings?player_id=${id}`),
      api.get<Order[]>(`/api/players/${id}/orders`),
    ])
      .then(([p, r, o]) => {
        setPlayer(p);
        setRatings(r);
        setOrders(o);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!player) return (
    <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
      <p className="text-lg">Player not found</p>
    </div>
  );

  const positive = player.reputation.positive || 0;
  const negative = player.reputation.negative || 0;
  const total = positive + negative;
  const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-0">
          <Avatar className="size-16 ring-2 ring-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-heading">
              {player.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-2xl">{player.username}</CardTitle>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Gamepad2Icon className="size-3.5" />
                {player.platform.toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3.5" />
                {new Date(player.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-success">
              <ThumbsUpIcon className="size-4" />
              <span className="font-medium">{positive}</span>
            </div>
            {negative > 0 && (
              <div className="flex items-center gap-1.5 text-destructive">
                <ThumbsDownIcon className="size-4" />
                <span className="font-medium">{negative}</span>
              </div>
            )}
            <span className="text-muted-foreground">{total} rating{total !== 1 ? "s" : ""}</span>
          </div>
          {total > 0 && (
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden flex">
              <div className="bg-success transition-all" style={{ width: `${positivePct}%` }} />
              {negative > 0 && (
                <div className="bg-destructive transition-all" style={{ width: `${100 - positivePct}%` }} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="ratings">
        <TabsList className="w-full">
          <TabsTrigger value="ratings" className="flex-1">Ratings ({ratings.length})</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ratings" className="mt-4 space-y-2">
          {ratings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No ratings yet.</p>
          ) : (
            ratings.map((r) => (
              <Card key={r._id} size="sm">
                <CardContent className="flex items-start gap-3 pt-(--card-spacing)">
                  {r.rating_value === "positive" ? (
                    <ThumbsUpIcon className="size-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <ThumbsDownIcon className="size-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    {r.comment && <p className="text-sm">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString()}
                      {r.rater_username && ` · by ${r.rater_username}`}
                    </p>
                  </div>
                  <Badge variant={r.rating_value === "positive" ? "default" : "destructive"} className="shrink-0">
                    {r.rating_value}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Plat</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell>
                      <Badge variant={o.order_type === "sell" ? "default" : "secondary"} className="text-[10px]">
                        {o.order_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gold">{o.platinum}p</TableCell>
                    <TableCell className="text-muted-foreground">x{o.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
