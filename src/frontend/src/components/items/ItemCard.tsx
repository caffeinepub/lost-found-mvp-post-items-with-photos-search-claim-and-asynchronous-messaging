import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, Package } from "lucide-react";
import type { Item } from "../../backend";
import { ItemType } from "../../backend";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();

  const statusColors = {
    missing:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    claimed:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    returned:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  };

  const typeColors = {
    [ItemType.lost]:
      "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    [ItemType.found]:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  };

  const statusLabels = {
    missing: "Still Missing",
    claimed: "Claimed",
    returned: "Returned",
  };

  const typeLabels = {
    [ItemType.lost]: "Lost",
    [ItemType.found]: "Found",
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() =>
        navigate({ to: "/item/$itemId", params: { itemId: item.id } })
      }
    >
      {item.photo && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          <img
            src={item.photo.getDirectURL()}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg">{item.title}</CardTitle>
          <Badge variant="outline" className={typeColors[item.itemType]}>
            {typeLabels[item.itemType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            {item.category}
          </Badge>
          <Badge variant="outline" className={statusColors[item.status]}>
            {statusLabels[item.status]}
          </Badge>
        </div>

        <div className="flex flex-col gap-1 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {item.dateTime}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
