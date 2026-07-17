"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createNotificationChannel } from "@/lib/ably";
import type { NotificationEvent, NotificationType } from "@/lib/ably";

/** Threshold for flood batching: if more than this many notifications arrive within 1 second, batch them. */
const FLOOD_THRESHOLD = 10;
/** Time window for flood detection in milliseconds. */
const FLOOD_WINDOW_MS = 1000;
/** Auto-dismiss duration for toast notifications in milliseconds. */
const TOAST_DURATION_MS = 5000;

/** Mapping from notification type to navigation route. */
export const NOTIFICATION_ROUTES: Record<NotificationType, string> = {
  TOPUP_COMPLETED: "/topup",
  P2P_RECEIVED: "/transfer",
  BILL_PAID: "/bills",
  SECURITY_ALERT: "/security",
};

/**
 * Get the navigation route for a notification type.
 * Falls back to /notifications for unknown types.
 */
export function getNotificationRoute(type: NotificationType): string {
  return NOTIFICATION_ROUTES[type] || "/notifications";
}

/**
 * Hook to subscribe to real-time notifications and display toast popups.
 *
 * Handles flood batching: if more than 10 notifications arrive within 1 second,
 * they are batched into a single toast with the count.
 *
 * @param userId - The user ID to subscribe to notifications for.
 */
export function useNotificationToast(userId: string) {
  const router = useRouter();
  const batchCountRef = useRef(0);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushBatch = useCallback(() => {
    if (batchCountRef.current > 0) {
      if (batchCountRef.current > FLOOD_THRESHOLD) {
        // Show batch toast
        toast.success(
          `${batchCountRef.current} nuevas notificaciones`,
          { duration: TOAST_DURATION_MS }
        );
      } else {
        // Show individual toasts (already shown in handler)
      }
      batchCountRef.current = 0;
    }
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const channel = createNotificationChannel(userId);

    const handleNotification = (event: NotificationEvent) => {
      batchCountRef.current += 1;

      // If this is the first notification in a new batch, start a timer
      if (batchCountRef.current === 1) {
        batchTimerRef.current = setTimeout(() => {
          flushBatch();
        }, FLOOD_WINDOW_MS);
      }

      // If we haven't exceeded the threshold yet, show individual toast
      if (batchCountRef.current <= FLOOD_THRESHOLD) {
        const route = getNotificationRoute(event.type);
        toast.success(`${event.title}: ${event.message}`, {
          duration: TOAST_DURATION_MS,
          action: {
            label: "Ver",
            onClick: () => {
              router.push(route);
            },
          },
        });
      }
      // If we exceed threshold, we'll show a batch toast when the timer fires
    };

    channel.subscribe(handleNotification);

    return () => {
      channel.unsubscribe(handleNotification);
      channel.disconnect();
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, [userId, router, flushBatch]);
}