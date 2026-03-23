import type { Principal } from "@dfinity/principal";
import { useCallback, useEffect, useState } from "react";
import { serializeSubscription, subscribeToPush } from "../utils/webPush";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type PushPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export interface UsePushNotificationsReturn {
  permission: PushPermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

// Extended actor type to include push notification methods not in the generated backend
interface ActorWithPush {
  registerPushSubscription(
    endpoint: string,
    p256dh: string,
    auth: string,
  ): Promise<void>;
  unregisterPushSubscription(endpoint: string): Promise<void>;
  getRecipientPushSubscriptions(
    recipient: Principal,
  ): Promise<Array<{ endpoint: string; p256dh: string; auth: string }>>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check current permission and subscription state on mount
  useEffect(() => {
    if (!("Notification" in window) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermissionState);

    navigator.serviceWorker.ready
      .then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        }),
      )
      .catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    if (!actor || !identity) return;
    setIsLoading(true);
    try {
      const permResult = await Notification.requestPermission();
      setPermission(permResult as PushPermissionState);
      if (permResult !== "granted") return;

      const sub = await subscribeToPush();
      if (!sub) return;

      const { endpoint, p256dh, auth } = serializeSubscription(sub);
      if (!p256dh || !auth) return;

      await (actor as unknown as ActorWithPush).registerPushSubscription(
        endpoint,
        p256dh,
        auth,
      );
      setIsSubscribed(true);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [actor, identity]);

  const unsubscribe = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await (actor as unknown as ActorWithPush).unregisterPushSubscription(
          sub.endpoint,
        );
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}

// Re-export the extended actor type for use in other modules
export type { ActorWithPush };
