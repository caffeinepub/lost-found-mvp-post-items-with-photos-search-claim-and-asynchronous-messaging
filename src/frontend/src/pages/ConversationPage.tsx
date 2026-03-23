import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import MessageComposer from "../components/conversations/MessageComposer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetConversation,
  useGetItem,
  useGetUserProfile,
} from "../hooks/useQueries";
import { getInitials } from "../utils/identity";

export default function ConversationPage() {
  const { conversationId } = useParams({
    from: "/conversation/$conversationId",
  });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: conversation, isLoading } = useGetConversation(conversationId);
  const { data: item } = useGetItem(conversation?.itemId || "");

  const otherParticipant = conversation?.participants.find(
    (p) => p.toString() !== identity?.getPrincipal().toString(),
  );
  const { data: otherProfile } = useGetUserProfile(otherParticipant);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold">Conversation not found</h2>
        <p className="text-muted-foreground mt-2">
          The conversation you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access to it.
        </p>
        <Button onClick={() => navigate({ to: "/inbox" })} className="mt-4">
          Back to Inbox
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/inbox" })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inbox
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {otherProfile ? getInitials(otherProfile.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{otherProfile?.name || "User"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Re: {item?.title || "Item"}
              </p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <Alert className="m-4 border-amber-500/50 bg-amber-500/10">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Safety reminder:</strong> Always meet in a public place,
              verify item details before meeting, and never share personal
              financial information.
            </AlertDescription>
          </Alert>

          <ScrollArea className="h-[400px] px-4">
            <div className="space-y-4 py-4">
              {conversation.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                conversation.messages.map((message) => {
                  const isOwnMessage =
                    message.sender.toString() ===
                    identity?.getPrincipal().toString();
                  const timestamp = format(
                    Number(message.timestamp) / 1000000,
                    "MMM d, h:mm a",
                  );
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }
                        >
                          {isOwnMessage
                            ? "You"
                            : otherProfile
                              ? getInitials(otherProfile.name)
                              : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex-1 space-y-1 ${
                          isOwnMessage ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground px-1">
                          {timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <Separator />
          <div className="p-4">
            <MessageComposer
              conversationId={conversationId}
              recipientPrincipal={otherParticipant}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
