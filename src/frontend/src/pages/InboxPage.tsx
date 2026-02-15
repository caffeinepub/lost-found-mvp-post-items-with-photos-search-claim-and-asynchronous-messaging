import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserConversations } from '../hooks/useQueries';
import ConversationListItem from '../components/conversations/ConversationListItem';
import { Loader2, Inbox } from 'lucide-react';

export default function InboxPage() {
  const { identity } = useInternetIdentity();
  const { data: conversations = [], isLoading } = useGetUserConversations(identity?.getPrincipal());

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Your conversations about lost and found items
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">No conversations yet</h3>
            <p className="text-muted-foreground">
              Start a conversation by contacting someone about an item
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}
    </div>
  );
}
