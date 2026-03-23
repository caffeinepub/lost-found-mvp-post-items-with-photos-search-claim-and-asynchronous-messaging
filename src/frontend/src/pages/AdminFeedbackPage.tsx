import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AdminStarRating } from "../components/StarRating";
import type { FeedbackEntryWithReadStatus } from "../hooks/useFeedback";
import { useGetAllFeedback, useIsCallerAdmin } from "../hooks/useFeedback";

function truncatePrincipal(principal: { toString(): string }): string {
  const str = principal.toString();
  if (str.length <= 14) return str;
  return `${str.slice(0, 8)}...${str.slice(-4)}`;
}

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function FeedbackRow({
  entry,
  index,
  onMarkRead,
}: {
  entry: FeedbackEntryWithReadStatus;
  index: number;
  onMarkRead: (id: bigint) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ratingValue = Number(entry.rating);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      data-ocid={`admin.feedback.item.${index + 1}`}
      className={`group relative rounded-lg border transition-all duration-200 ${
        !entry.isRead
          ? "bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
          : "bg-card border-border hover:bg-muted/30"
      }`}
    >
      <button
        type="button"
        className="w-full text-left p-4"
        onClick={() => {
          if (!entry.isRead) onMarkRead(entry.id);
          setExpanded((v) => !v);
        }}
      >
        <div className="flex items-start gap-3">
          {/* Unread indicator */}
          <div className="mt-1 flex-shrink-0">
            {!entry.isRead ? (
              <span className="block h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
            ) : (
              <span className="block h-2.5 w-2.5 rounded-full border border-muted-foreground/30" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {truncatePrincipal(entry.user)}
                </span>
                {ratingValue > 0 && (
                  <AdminStarRating value={ratingValue} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {!entry.isRead && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300"
                  >
                    New
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(entry.createdAt)}
                </span>
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </div>

            <p
              className={`mt-1.5 text-sm text-foreground leading-relaxed ${
                !expanded ? "line-clamp-1" : ""
              }`}
            >
              {entry.message}
            </p>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div data-ocid="admin.feedback.loading_state" className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const {
    data: feedbackList,
    isLoading: feedbackLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useGetAllFeedback();

  const sorted = [...(feedbackList ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  if (adminLoading) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-7 w-48" />
        </div>
        <LoadingSkeleton />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You don&apos;t have permission to view this page. Admin access is
          required.
        </p>
      </main>
    );
  }

  return (
    <main
      data-ocid="admin.feedback.page"
      className="container max-w-3xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
            <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Feedback
              {unreadCount > 0 && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-5 px-2">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sorted.length} total entr{sorted.length === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>

        <Button
          data-ocid="admin.feedback.mark_all_button"
          variant="outline"
          size="sm"
          disabled={unreadCount === 0}
          onClick={() => markAllAsRead(sorted)}
          className="gap-2"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            All Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {feedbackLoading ? (
            <LoadingSkeleton />
          ) : sorted.length === 0 ? (
            <div
              data-ocid="admin.feedback.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="rounded-full bg-muted p-4 mb-3">
                <ShieldCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">
                No feedback yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                User feedback will appear here once submitted.
              </p>
            </div>
          ) : (
            <div data-ocid="admin.feedback.list" className="space-y-2">
              <AnimatePresence initial={false}>
                {sorted.map((entry, i) => (
                  <FeedbackRow
                    key={entry.id.toString()}
                    entry={entry}
                    index={i}
                    onMarkRead={markAsRead}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
