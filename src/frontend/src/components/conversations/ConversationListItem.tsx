import { useNavigate } from '@tanstack/react-router';
import type { Conversation } from '../../backend';
import { useGetItem, useGetUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { getInitials } from '../../utils/identity';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
  conversation: Conversation;
}

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: item } = useGetItem(conversation.itemId);

  // Get the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.toString() !== identity?.getPrincipal().toString()
  );
  const { data: otherProfile } = useGetUserProfile(otherParticipant);

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const lastMessageTime = lastMessage
    ? formatDistanceToNow(Number(lastMessage.timestamp) / 1000000, { addSuffix: true })
    : 'No messages yet';

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() =>
        navigate({ to: '/conversation/$conversationId', params: { conversationId: conversation.id } })
      }
    >
      <CardContent className="flex gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {otherProfile ? getInitials(otherProfile.name) : '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">
                {otherProfile?.name || 'User'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                Re: {item?.title || 'Item'}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 gap-1">
              <MessageCircle className="h-3 w-3" />
              {conversation.messages.length}
            </Badge>
          </div>

          {lastMessage && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {lastMessage.content}
            </p>
          )}

          <p className="text-xs text-muted-foreground">{lastMessageTime}</p>
        </div>
      </CardContent>
    </Card>
  );
}
