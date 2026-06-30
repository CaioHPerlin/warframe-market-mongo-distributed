import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

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
      <Input
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <Link key={item._id} to={`/items/${item._id}`} className="no-underline">
              <Card size="sm" className="hover:border-ring transition-colors cursor-pointer h-full">
                <CardContent className="flex flex-col gap-1.5 pt-(--card-spacing)">
                  <CardTitle>{item.item_name}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
