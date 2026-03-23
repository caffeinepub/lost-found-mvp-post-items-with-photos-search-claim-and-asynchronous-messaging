import type { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "../backend";
import { useActor } from "./useActor";

export function useGetUserConversationsWithPolling(
  user: Principal | undefined,
) {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation[]>({
    queryKey: ["conversations", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserConversations(user);
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 5000,
  });
}

export function useGetConversationWithPolling(conversationId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation | null>({
    queryKey: ["conversations", conversationId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getConversation(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
    refetchInterval: 3000,
  });
}
