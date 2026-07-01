import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PackageIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlatinumIcon } from "../components/PlatinumIcon";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { api } from "../lib/api";

const CATEGORY_TAGS = [
  "weapon",
  "primary",
  "secondary",
  "melee",
  "mod",
  "warframe",
  "relic",
  "sentinel",
  "archwing",
  "companion",
  "fish",
  "gem",
  "resource",
  "blueprint",
  "key",
] as const;

type ItemWithPrice = {
  _id: string;
  item_name: string;
  url_name: string;
  thumb?: string;
  tags: string[];
  minSellPrice?: number;
  avgSellPrice?: number;
  lastTransactionPrice?: number;
};

type PaginatedResponse = {
  data: ItemWithPrice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const ITEMS_PER_PAGE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function ItemsPage() {
  const [items, setItems] = useState<ItemWithPrice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tag]);

  useEffect(() => {
    const abort = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (tag) params.set("tag", tag);
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      try {
        const res = await api.get<PaginatedResponse>(`/api/items?${params}`, {
          signal: abort.signal,
        });
        if (!abort.signal.aborted) {
          setItems(res.data);
          setTotal(res.total);
          setPages(res.pages);
        }
      } catch {
        if (!abort.signal.aborted) setItems([]);
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    };
    fetchItems();

    return () => abort.abort();
  }, [debouncedSearch, tag, page]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold tracking-tight text-tea-green">
          Warframe Market
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total > 0
            ? `${total} items in the market`
            : "Browse and search all Warframe items"}
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-11 text-base"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TAGS.map((t) => (
          <Badge
            key={t}
            variant={tag === t ? "default" : "secondary"}
            className="cursor-pointer select-none transition-colors text-xs px-3 py-1.5 capitalize"
            onClick={() => setTag(tag === t ? "" : t)}
          >
            {t}
          </Badge>
        ))}
        {tag && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTag("")}
            className="text-muted-foreground gap-1"
          >
            <XIcon className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="h-21 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
          <PackageIcon className="size-16 opacity-20" />
          <p className="text-lg">No items found</p>
          {(search || tag) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setTag("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Page {page} of {pages} &middot; {total} items
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="default"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} / {pages}
            </span>
            <Button
              variant="outline"
              size="default"
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

function ItemCard({ item }: { item: ItemWithPrice }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/items/${item._id}`} className="no-underline">
      <Card
        size="sm"
        className="hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer h-full group"
      >
        <CardContent className="flex items-center gap-4">
          <div className="size-14 rounded-lg shrink-0 bg-muted/30 relative overflow-hidden">
            {item.thumb && !imgError ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground/40" />
                  </div>
                )}
                <img
                  src={item.thumb}
                  alt=""
                  className={`size-full object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              </>
            ) : (
              <div className="size-full flex items-center justify-center">
                <ImageIcon className="size-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium truncate group-hover:text-primary transition-colors">
              {item.item_name}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <PlatinumIcon className="size-5 text-gold" />
              <span className="text-xl font-bold text-gold">
                {item.minSellPrice ?? item.lastTransactionPrice ?? "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
