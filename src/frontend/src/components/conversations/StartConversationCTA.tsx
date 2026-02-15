import { useNavigate } from '@tanstack/react-router';
import { useCreateConversation } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { getUserFriendlyError } from '../../utils/errors';
import { toast } from 'sonner';

interface StartConversationCTAProps {
  itemId: string;
  isOwnItem: boolean;
}

export default function StartConversationCTA({ itemId, isOwnItem }: StartConversationCTAProps) {
  const navigate = useNavigate();
  const createMutation = useCreateConversation();

  if (isOwnItem) {
    return null;
  }

  const handleStartConversation = async () => {
    try {
      const conversationId = await createMutation.mutateAsync(itemId);
      navigate({ to: '/conversation/$conversationId', params: { conversationId } });
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Button
      onClick={handleStartConversation}
      disabled={createMutation.isPending}
      size="lg"
      className="w-full gap-2"
    >
      {createMutation.isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Starting conversation...
        </>
      ) : (
        <>
          <MessageCircle className="h-5 w-5" />
          Contact About This Item
        </>
      )}
    </Button>
  );
}
