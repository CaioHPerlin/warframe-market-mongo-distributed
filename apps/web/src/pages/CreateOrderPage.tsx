import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

const PLATFORMS = ["pc", "ps4", "xbox", "switch"] as const;

export default function CreateOrderPage() {
  const { player } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("item_id") || "";

  const [orderType, setOrderType] = useState<"buy" | "sell">("sell");
  const [platinum, setPlatinum] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [platform, setPlatform] = useState(player?.platform || "pc");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (player?.platform) setPlatform(player.platform);
  }, [player]);

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You must be logged in to place an order.</p>
        <Button render={<Link to="/login" />}>Login</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) { toast.error("No item selected"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/orders", {
        item_id: itemId,
        order_type: orderType,
        platinum: Number(platinum),
        quantity: Number(quantity),
        platform,
      });
      toast.success("Order placed");
      navigate(`/items/${itemId}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center pt-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
          <CardDescription>Set your price and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(v) => v && setOrderType(v as "buy" | "sell")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="platinum">Platinum</Label>
              <Input id="platinum" type="number" min={0} value={platinum} onChange={(e) => setPlatinum(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Placing..." : "Place Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
