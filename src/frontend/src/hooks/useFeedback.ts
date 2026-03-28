import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FeedbackEntry, FeedbackEntryWithReadStatus } from "../backend";
import { useActor } from "./useActor";

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

export function useGetAllFeedback() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<FeedbackEntryWithReadStatus[]>({
    queryKey: ["feedback", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeedback();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const markAsRead = async (id: bigint) => {
    if (!actor) return;
    await actor.markFeedbackAsRead(id);
    queryClient.invalidateQueries({ queryKey: ["feedback", "all"] });
  };

  const markAllAsRead = async () => {
    if (!actor) return;
    await actor.markAllFeedbackAsRead();
    queryClient.invalidateQueries({ queryKey: ["feedback", "all"] });
  };

  const unreadCount = (query.data ?? []).filter((e) => !e.isRead).length;

  return {
    ...query,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
