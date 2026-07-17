"use client";

import { useAuth } from "@/lib/auth";
import { useNotificationToast } from "@/hooks/use-notification-toast";

/**
 * NotificationToast provider component.
 *
 * Subscribes to real-time notifications and displays toast popups.
 * Should be placed in the dashboard layout to receive notifications.
 */
export function NotificationToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id;

  // Only subscribe if we have a user ID
  useNotificationToast(userId ?? "");

  return <>{children}</>;
}