import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { FeedbackEntry } from "../backend";
import { useActor } from "./useActor";

const READ_KEY = "admin_feedback_read_ids";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function useGetCallerFeedback() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<FeedbackEntry[]>({
    queryKey: ["feedback", "caller"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerFeedback();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { message: string; rating: number }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitFeedback(data.message, BigInt(data.rating));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export interface FeedbackEntryWithReadStatus extends FeedbackEntry {
  isRead: boolean;
}

export function useGetAllFeedback() {
  const { actor, isFetching: actorFetching } = useActor();
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadIds());

  const query = useQuery<FeedbackEntry[]>({
    queryKey: ["feedback", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeedback();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const markAsRead = useCallback((id: bigint) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id.toString());
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((entries: FeedbackEntry[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const e of entries) next.add(e.id.toString());
      saveReadIds(next);
      return next;
    });
  }, []);

  const withStatus: FeedbackEntryWithReadStatus[] = (query.data ?? []).map(
    (e) => ({
      ...e,
      isRead: readIds.has(e.id.toString()),
    }),
  );

  const unreadCount = withStatus.filter((e) => !e.isRead).length;

  return {
    ...query,
    data: withStatus,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
