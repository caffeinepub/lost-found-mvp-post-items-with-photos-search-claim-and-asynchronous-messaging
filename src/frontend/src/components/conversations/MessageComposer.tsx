import { useState } from 'react';
import { useSendMessage } from '../../hooks/useQueries';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { getUserFriendlyError } from '../../utils/errors';
import { toast } from 'sonner';

interface MessageComposerProps {
  conversationId: string;
}

export default function MessageComposer({ conversationId }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const sendMutation = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendMutation.mutateAsync({ conversationId, message: trimmedMessage });
      setMessage('');
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={sendMutation.isPending}
        className="min-h-[80px] resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button
        type="submit"
        disabled={!message.trim() || sendMutation.isPending}
        size="icon"
        className="h-[80px] w-12 shrink-0"
      >
        {sendMutation.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
