import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ItemType } from "../backend";
import type { ExternalBlob } from "../backend";
import PhotoPicker from "../components/items/PhotoPicker";
import { useCreateItem } from "../hooks/useQueries";
import { getUserFriendlyError } from "../utils/errors";
import { validateMinLength, validateRequired } from "../utils/validation";

const CATEGORIES = [
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

interface ReportItemPageProps {
  itemType: ItemType;
}

export default function ReportItemPage({ itemType }: ReportItemPageProps) {
  const navigate = useNavigate();
  const createMutation = useCreateItem();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [photo, setPhoto] = useState<ExternalBlob | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLost = itemType === "lost";

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleError =
      validateRequired(title, "Title") || validateMinLength(title, 3, "Title");
    if (titleError) newErrors.title = titleError;

    const descError =
      validateRequired(description, "Description") ||
      validateMinLength(description, 10, "Description");
    if (descError) newErrors.description = descError;

    const categoryError = validateRequired(category, "Category");
    if (categoryError) newErrors.category = categoryError;

    const locationError = validateRequired(location, "Location");
    if (locationError) newErrors.location = locationError;

    const dateTimeError = validateRequired(dateTime, "Date/Time");
    if (dateTimeError) newErrors.dateTime = dateTimeError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const itemId = await createMutation.mutateAsync({
        itemType,
        title,
        description,
        category,
        location,
        dateTime,
        photo,
      });

      toast.success(`${isLost ? "Lost" : "Found"} item reported successfully`);
      navigate({ to: "/item/$itemId", params: { itemId } });
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/browse" })}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Report {isLost ? "Lost" : "Found"} Item</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help{" "}
            {isLost ? "others find" : "reunite"} your item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Item Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Black iPhone 13"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createMutation.isPending}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the item..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createMutation.isPending}
                className="min-h-[120px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={createMutation.isPending}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location {isLost ? "Last Seen" : "Found"} *
              </Label>
              <Input
                id="location"
                placeholder="e.g., City Park, Main Street"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={createMutation.isPending}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTime">Date/Time *</Label>
              <Input
                id="dateTime"
                placeholder="e.g., January 15, 2026 around 3pm"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                disabled={createMutation.isPending}
              />
              {errors.dateTime && (
                <p className="text-sm text-destructive">{errors.dateTime}</p>
              )}
            </div>

            <PhotoPicker
              onPhotoChange={setPhoto}
              disabled={createMutation.isPending}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Report ${isLost ? "Lost" : "Found"} Item`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
