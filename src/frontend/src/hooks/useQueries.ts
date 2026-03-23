import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Conversation,
  Item,
  ItemType,
  Status,
  UserProfile,
} from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

// Items
export function useSearchItems(
  keyword: string,
  category: string | null,
  itemType: ItemType | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ["items", "search", keyword, category, itemType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchItems(keyword, category, itemType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetItem(itemId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ["items", itemId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getItem(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useCreateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemType: ItemType;
      title: string;
      description: string;
      category: string;
      location: string;
      dateTime: string;
      photo: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createItem(
        data.itemType,
        data.title,
        data.description,
        data.category,
        data.location,
        data.dateTime,
        data.photo,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItemStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { itemId: string; newStatus: Status }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateItemStatus(data.itemId, data.newStatus);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ["items", "search"] });
    },
  });
}

// Conversations
export function useGetUserConversations(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation[]>({
    queryKey: ["conversations", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserConversations(user);
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useGetConversation(conversationId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation | null>({
    queryKey: ["conversations", conversationId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getConversation(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });
}

export function useCreateConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createConversation(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; message: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(data.conversationId, data.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Public Stats
export function useGetRegisteredUsersCount() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ["registeredUsersCount"],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getRegisteredUsersCount();
      return Number(count);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// User Profile
export function useGetUserProfile(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}
