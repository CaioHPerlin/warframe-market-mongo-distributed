import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  SearchIcon,
  PackageIcon,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  XIcon,
} from "lucide-react";

type Item = {
  _id: string;
  item_name: string;
  url_name: string;
  tags: string[];
  thumb?: string;
};

type PaginatedResponse = {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const ITEMS_PER_PAGE = 24;

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<string[]>("/api/items/tags").then(setAllTags).catch(() => {});
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (tag) params.set("tag", tag);
    params.set("page", String(page));
    params.set("limit", String(ITEMS_PER_PAGE));

    try {
      const res = await api.get<PaginatedResponse>(`/api/items?${params}`);
      setItems(res.data);
      setTotal(res.total);
      setPage(res.page);
      setPages(res.pages);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, tag, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [search, tag]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-heading font-bold tracking-tight">Items</h1>
        <p className="text-sm text-muted-foreground">{total > 0 ? `${total} items in the market` : "Browse and search all Warframe items"}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterIcon className="size-3.5 text-muted-foreground shrink-0" />
        {allTags.slice(0, 20).map((t) => (
          <Badge
            key={t}
            variant={tag === t ? "default" : "secondary"}
            className="cursor-pointer select-none transition-colors"
            onClick={() => setTag(tag === t ? "" : t)}
          >
            {t}
          </Badge>
        ))}
        {tag && (
          <Button variant="ghost" size="xs" onClick={() => setTag("")} className="text-muted-foreground">
            <XIcon className="size-3" />
            Clear
          </Button>
        )}
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
          {(search || tag) && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setTag(""); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Page {page} of {pages} ({total} items)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((item) => (
              <Link key={item._id} to={`/items/${item._id}`} className="no-underline">
                <Card size="sm" className="hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer h-full group">
                  <CardContent className="flex items-center gap-3 pt-(--card-spacing)">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt=""
                        className="size-10 rounded object-contain shrink-0 bg-muted/50"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-10 rounded shrink-0 bg-muted/30 flex items-center justify-center">
                        <ImageIcon className="size-4 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {item.item_name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags?.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px] leading-none py-0.5">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
