import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

const PLATFORMS = ["pc", "ps4", "xbox", "switch"];

export default function CreateOrderPage() {
  const { player } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("item_id") || "";

  const [platform, setPlatform] = useState("pc");
  const [orderType, setOrderType] = useState<"buy" | "sell">("sell");
  const [platinum, setPlatinum] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!player) {
    return (
      <div className="mt-12 text-center">
        <p className="text-warframe-muted">You must be logged in to place an order.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/orders", {
        item_id: itemId,
        platform,
        order_type: orderType,
        platinum: parseInt(platinum, 10),
        quantity: parseInt(quantity, 10),
      });
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (success) {
    return (
      <div className="mt-12 text-center">
        <p className="text-warframe-green mb-4">Order placed successfully!</p>
        <button
          onClick={() => nav(`/items/${itemId}`)}
          className="bg-warframe-accent text-white rounded px-4 py-2 cursor-pointer"
        >
          Back to item
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-bold mb-6">Place Order</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-warframe-muted block mb-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-warframe-surface border border-warframe-border rounded px-3 py-2 text-warframe-text"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-warframe-muted block mb-1">Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as "buy" | "sell")}
            className="w-full bg-warframe-surface border border-warframe-border rounded px-3 py-2 text-warframe-text"
          >
            <option value="sell">Sell</option>
            <option value="buy">Buy</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-warframe-muted block mb-1">Price (platinum)</label>
          <input
            type="number"
            min="1"
            value={platinum}
            onChange={(e) => setPlatinum(e.target.value)}
            className="w-full bg-warframe-surface border border-warframe-border rounded px-3 py-2 text-warframe-text placeholder-warframe-muted"
          />
        </div>
        <div>
          <label className="text-sm text-warframe-muted block mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-warframe-surface border border-warframe-border rounded px-3 py-2 text-warframe-text placeholder-warframe-muted"
          />
        </div>
        {error && <p className="text-warframe-red text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-warframe-accent text-white rounded px-4 py-2 hover:opacity-90 cursor-pointer"
        >
          Place Order
        </button>
      </form>
    </div>
  );
}
