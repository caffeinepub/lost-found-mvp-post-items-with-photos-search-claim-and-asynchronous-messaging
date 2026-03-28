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

export function usePushNotifications(): UsePushNotificationsReturn {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

      await actor.registerPushSubscription(endpoint, p256dh, auth);
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
        await actor.unregisterPushSubscription(sub.endpoint);
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
