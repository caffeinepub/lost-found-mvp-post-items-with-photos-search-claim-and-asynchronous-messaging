import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, MessageSquare } from "lucide-react";
import ConversationListItem from "../components/conversations/ConversationListItem";
import PushNotificationPrompt, {
  PushNotificationToggle,
} from "../components/notifications/PushNotificationPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserConversations } from "../hooks/useQueries";

export default function InboxPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: conversations = [], isLoading } =
    useGetUserConversations(principal);

  return (
    <div className="container max-w-2xl py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <PushNotificationToggle />
      </div>

      {/* Push notification opt-in prompt */}
      <PushNotificationPrompt />

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="inbox.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <Card data-ocid="inbox.empty_state">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                When you contact someone about a lost or found item, your
                conversation will appear here.
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/browse" })}
              data-ocid="inbox.browse.button"
            >
              Browse Items
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {conversations.map((convo, i) => (
              <div
                key={convo.id}
                data-ocid={`inbox.conversation.item.${i + 1}`}
              >
                <ConversationListItem conversation={convo} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
