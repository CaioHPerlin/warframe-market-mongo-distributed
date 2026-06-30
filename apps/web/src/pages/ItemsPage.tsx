import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { SearchIcon, PackageIcon } from "lucide-react";

type Item = {
  _id: string;
  item_name: string;
  url_name: string;
  tags: string[];
  thumb?: string;
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
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Items</h1>
        <p className="text-sm text-muted-foreground">Browse and search all Warframe items</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <PackageIcon className="size-12 opacity-30" />
          <p>No items found</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((item) => (
              <Link key={item._id} to={`/items/${item._id}`} className="no-underline">
                <Card size="sm" className="hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer h-full group">
                  <CardContent className="flex items-center gap-3 pt-(--card-spacing)">
                    {item.thumb && (
                      <img
                        src={item.thumb}
                        alt=""
                        className="size-10 rounded object-contain shrink-0 bg-muted/50"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {item.item_name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] leading-none py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
