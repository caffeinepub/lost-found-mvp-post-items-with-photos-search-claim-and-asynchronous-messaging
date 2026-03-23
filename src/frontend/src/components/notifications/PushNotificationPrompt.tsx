import { Bell, BellOff, X } from "lucide-react";
import { useState } from "react";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { Button } from "../ui/button";

export default function PushNotificationPrompt() {
  const { permission, isSubscribed, isLoading, subscribe } =
    usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Only show the prompt banner when permission hasn't been decided yet
  if (
    dismissed ||
    permission === "unsupported" ||
    permission === "denied" ||
    isSubscribed
  ) {
    return null;
  }

  if (permission === "granted") return null;

  return (
    <div
      data-ocid="push.prompt.panel"
      className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
    >
      <Bell className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-muted-foreground">
        Enable push notifications to get alerted when you receive new messages.
      </p>
      <Button
        size="sm"
        variant="default"
        onClick={subscribe}
        disabled={isLoading}
        data-ocid="push.subscribe.button"
      >
        {isLoading ? "Enabling..." : "Enable"}
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground"
        data-ocid="push.prompt.close_button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Small manage-button used in settings/inbox area
export function PushNotificationToggle() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (permission === "unsupported") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading || permission === "denied"}
      data-ocid="push.toggle.button"
      title={
        permission === "denied"
          ? "Notifications blocked in browser settings"
          : isSubscribed
            ? "Disable push notifications"
            : "Enable push notifications"
      }
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Notifications On
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          {permission === "denied"
            ? "Notifications Blocked"
            : "Enable Notifications"}
        </>
      )}
    </Button>
  );
}
