import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@dfinity/principal";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { useGetCallerUserProfile } from "../../hooks/useCurrentUser";
import type { ActorWithPush } from "../../hooks/usePushNotifications";
import { useSendMessage } from "../../hooks/useQueries";
import { getUserFriendlyError } from "../../utils/errors";
import type { PushSubscriptionData } from "../../utils/webPush";
import { sendWebPush } from "../../utils/webPush";

interface MessageComposerProps {
  conversationId: string;
  recipientPrincipal?: Principal;
}

export default function MessageComposer({
  conversationId,
  recipientPrincipal,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const sendMutation = useSendMessage();
  const { actor } = useActor();
  const { data: callerProfile } = useGetCallerUserProfile();

  const triggerPushNotification = async (text: string) => {
    if (!actor || !recipientPrincipal) return;
    try {
      const pushActor = actor as unknown as ActorWithPush;
      const subs =
        await pushActor.getRecipientPushSubscriptions(recipientPrincipal);
      if (!subs || subs.length === 0) return;
      const senderName = callerProfile?.name || "Someone";
      const payload = {
        title: "Lost & Found — New Message",
        body: `${senderName}: ${text.slice(0, 100)}`,
        url: "/inbox",
      };
      await Promise.all(
        subs.map((sub: PushSubscriptionData) => sendWebPush(sub, payload)),
      );
    } catch {
      // push is best-effort
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast.error("Please enter a message");
      return;
    }
    try {
      await sendMutation.mutateAsync({
        conversationId,
        message: trimmedMessage,
      });
      setMessage("");
      // Fire-and-forget push notification
      triggerPushNotification(trimmedMessage);
    } catch (error) {
      toast.error(getUserFriendlyError(error));
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
        data-ocid="message.textarea"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
      />
      <Button
        type="submit"
        disabled={!message.trim() || sendMutation.isPending}
        size="icon"
        className="h-[80px] w-12 shrink-0"
        data-ocid="message.submit_button"
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
