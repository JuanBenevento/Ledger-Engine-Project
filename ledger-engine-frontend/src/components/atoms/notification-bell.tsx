"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  useUnreadCount,
  NOTIFICATION_TYPE_ICONS,
} from "@/lib/api/hooks/use-notifications";

/**
 * NotificationBell atom.
 *
 * Displays a bell icon with unread count badge.
 * Opens a dropdown preview of the last 5 notifications.
 * Click "Ver todas" navigates to /notifications.
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count for the badge
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

  // Fetch last 5 notifications for the preview
  const { data: notifData } = useNotifications(0, 5);
  const notifications = notifData?.content ?? [];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm font-medium hover:bg-muted"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} nuevas
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Sin notificaciones
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notif) => (
              <DropdownMenuItem
                key={notif.notification_id}
                className="flex cursor-pointer items-start gap-3 px-4 py-3"
              >
                <Link href="/notifications" className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">
                    {NOTIFICATION_TYPE_ICONS[notif.type ?? ""] ?? "🔔"}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {notif.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Link
                href="/notifications"
                className="text-sm font-medium text-primary"
              >
                Ver todas
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
