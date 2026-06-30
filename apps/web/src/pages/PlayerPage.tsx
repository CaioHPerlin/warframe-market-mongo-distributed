import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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
      <div className="max-w-lg mx-auto mt-8 space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!player) return <p className="text-destructive text-center py-12">Player not found</p>;

  const positive = player.reputation.positive || 0;
  const negative = player.reputation.negative || 0;
  const total = positive + negative;

  return (
    <div className="max-w-lg mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {player.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{player.username}</CardTitle>
            <Badge variant="outline" className="mt-1">{player.platform.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <span className="text-success">{positive} <span className="text-muted-foreground">positive</span></span>
            {negative > 0 && <span className="text-destructive">{negative} <span className="text-muted-foreground">negative</span></span>}
            <span className="text-muted-foreground">{total} total</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ratings">
        <TabsList>
          <TabsTrigger value="ratings">Ratings ({ratings.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ratings" className="mt-4">
          {ratings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No ratings yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {ratings.map((r) => (
                <Card key={r._id} size="sm">
                  <CardContent className="flex items-start gap-3 pt-(--card-spacing)">
                    <Badge variant={r.rating_value === "positive" ? "default" : "destructive"} className="shrink-0 mt-0.5">
                      {r.rating_value}
                    </Badge>
                    <div className="min-w-0">
                      {r.comment && <p className="text-sm">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
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
                    <TableCell className="text-gold">{o.platinum}p</TableCell>
                    <TableCell>x{o.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
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
