import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FeedbackEntry } from '../backend';

export function useGetCallerFeedback() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<FeedbackEntry[]>({
    queryKey: ['feedback', 'caller'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
    mutationFn: async (data: { message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitFeedback(data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
