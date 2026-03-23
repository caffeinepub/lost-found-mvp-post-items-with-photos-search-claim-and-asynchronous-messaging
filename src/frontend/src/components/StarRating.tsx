import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const labelMap: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const iconSize = sizeMap[size];
  const active = hovered || value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            aria-label={`Rate ${star} out of 5 — ${labelMap[star]}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              "transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default",
            )}
          >
            <Star
              className={cn(
                iconSize,
                "transition-colors duration-100",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
      {!readonly && active > 0 && (
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          {labelMap[active]}
        </span>
      )}
    </div>
  );
}

/**
 * Display-only star rating with colour coding for admin views:
 * 4–5 stars → amber, 3 stars → muted, 1–2 stars → red/orange
 */
export function AdminStarRating({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const iconSize = sizeMap[size];
  const filledColor =
    value >= 4
      ? "fill-amber-400 text-amber-400"
      : value === 3
        ? "fill-muted-foreground/50 text-muted-foreground/50"
        : "fill-red-400 text-red-400";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            iconSize,
            star <= value
              ? filledColor
              : "fill-transparent text-muted-foreground/25",
          )}
        />
      ))}
    </div>
  );
}
