import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { ItemType } from "../backend";
import StartConversationCTA from "../components/conversations/StartConversationCTA";
import ItemCard from "../components/items/ItemCard";
import StatusUpdateControl from "../components/items/StatusUpdateControl";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetItem, useSearchItems } from "../hooks/useQueries";
import { principalsEqual } from "../utils/identity";
import { calculateSimilarity, getKeywords } from "../utils/textSimilarity";

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: "/item/$itemId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: item, isLoading } = useGetItem(itemId);

  // Get possible matches
  const oppositeType: ItemType | null =
    item?.itemType === ItemType.lost
      ? ItemType.found
      : item?.itemType === ItemType.found
        ? ItemType.lost
        : null;
  const keywords = item
    ? getKeywords(`${item.title} ${item.description}`, 3).join(" ")
    : "";
  const { data: candidateMatches = [] } = useSearchItems(
    keywords,
    item?.category || null,
    oppositeType,
  );

  // Calculate similarity and filter matches
  const matches = item
    ? candidateMatches
        .filter((candidate) => candidate.id !== item.id)
        .map((candidate) => ({
          item: candidate,
          score: calculateSimilarity(
            `${item.title} ${item.description}`,
            `${candidate.title} ${candidate.description}`,
          ),
        }))
        .filter((match) => match.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold">Item not found</h2>
        <p className="text-muted-foreground mt-2">
          The item you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate({ to: "/browse" })} className="mt-4">
          Back to Browse
        </Button>
      </div>
    );
  }

  const isOwnItem =
    identity && principalsEqual(identity.getPrincipal(), item.createdBy);

  const statusColors = {
    missing:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    claimed:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    returned:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  };

  const typeColors = {
    lost: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    found:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  };

  const statusLabels = {
    missing: "Still Missing",
    claimed: "Claimed",
    returned: "Returned",
  };

  const typeLabels = {
    lost: "Lost Item",
    found: "Found Item",
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/browse" })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {item.photo && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                <img
                  src={item.photo.getDirectURL()}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={typeColors[item.itemType]}
                  >
                    {typeLabels[item.itemType]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={statusColors[item.status]}
                  >
                    {statusLabels[item.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <span className="text-muted-foreground">{item.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span className="text-muted-foreground">{item.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date/Time:</span>
                  <span className="text-muted-foreground">{item.dateTime}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Posted by:</span>
                  <span className="text-muted-foreground">
                    {isOwnItem ? "You" : "Another user"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Possible Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {matches.map(({ item: matchItem }) => (
                    <ItemCard key={matchItem.id} item={matchItem} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {isOwnItem && (
            <StatusUpdateControl
              itemId={item.id}
              currentStatus={item.status}
              canUpdate={true}
            />
          )}

          <StartConversationCTA itemId={item.id} isOwnItem={!!isOwnItem} />
        </div>
      </div>
    </div>
  );
}
