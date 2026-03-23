import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { ItemType } from "../backend";
import ItemCard from "../components/items/ItemCard";
import { useSearchItems } from "../hooks/useQueries";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Pets",
  "Wallets",
  "Jewelry",
  "Keys",
  "Bags",
  "Clothing",
  "Documents",
  "Other",
];

export default function BrowsePage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [itemType, setItemType] = useState<"all" | ItemType>("all");

  const searchCategory = category === "All Categories" ? null : category;
  const searchItemType = itemType === "all" ? null : itemType;

  const { data: items = [], isLoading } = useSearchItems(
    keyword,
    searchCategory,
    searchItemType,
  );

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Items</h1>
        <p className="text-muted-foreground">
          Search for lost or found items in your area
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title or description..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs
          value={itemType}
          onValueChange={(v) => setItemType(v as "all" | ItemType)}
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value={ItemType.lost}>Lost</TabsTrigger>
            <TabsTrigger value={ItemType.found}>Found</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <img
            src="/assets/generated/empty-search.dim_900x600.png"
            alt="No results"
            className="max-w-md w-full opacity-50"
          />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters or check back later
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
