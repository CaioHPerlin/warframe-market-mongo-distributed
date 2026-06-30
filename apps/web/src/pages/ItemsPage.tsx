import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Item = {
  _id: string;
  item_name: string;
  url_name: string;
  tags: string[];
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = search ? `?q=${encodeURIComponent(search)}` : "";
    api.get<Item[]>(`/api/items${params}`).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-warframe-surface border border-warframe-border rounded px-3 py-2 mb-6 text-warframe-text placeholder-warframe-muted"
      />
      {loading ? (
        <p className="text-warframe-muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-warframe-muted">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/items/${item._id}`}
              className="block border border-warframe-border bg-warframe-surface rounded p-4 hover:border-warframe-accent no-underline"
            >
              <h2 className="font-medium text-warframe-text">{item.item_name}</h2>
              <p className="text-sm text-warframe-muted mt-1">{item.tags?.join(", ")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
