"use client";

import { useCallback } from "react";
import { CheckCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications,
  useMarkAllRead,
  useMarkNotificationRead,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
} from "@/lib/api/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

/**
 * NotificationList page.
 *
 * Full inbox with paginated notifications (50/page).
 * "Marcar todo leído" button when unread notifications exist.
 * Type icons mapping for each notification category.
 */
export default function NotificationListPage() {
  const { data, isLoading, error } = useNotifications(0, 50);
  const markAllRead = useMarkAllRead();
  const markRead = useMarkNotificationRead();

  const notifications = data?.content ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAllRead = useCallback(() => {
    markAllRead.mutate();
  }, [markAllRead]);

  const handleMarkRead = useCallback(
    (notificationId: string) => {
      markRead.mutate(notificationId);
    },
    [markRead]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Error al cargar notificaciones</h2>
        <p className="text-sm text-muted-foreground">
          Intenta de nuevo más tarde
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="mt-1">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todo leído
          </Button>
        )}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Sin notificaciones</h2>
          <p className="text-sm text-muted-foreground">
            Cuando tengas nuevas notificaciones, aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.notification_id}
              notificationId={notif.notification_id ?? ""}
              type={notif.type ?? ""}
              title={notif.title ?? ""}
              message={notif.message ?? ""}
              isRead={notif.is_read ?? false}
              createdAt={notif.created_at ?? ""}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  onMarkRead: (id: string) => void;
}

function NotificationItem({
  notificationId,
  type,
  title,
  message,
  isRead,
  createdAt,
  onMarkRead,
}: NotificationItemProps) {
  const icon = NOTIFICATION_TYPE_ICONS[type] ?? "🔔";
  const typeLabel = NOTIFICATION_TYPE_LABELS[type] ?? "Notificación";

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        isRead ? "bg-background" : "bg-muted/50"
      }`}
      role="article"
      aria-label={`${typeLabel}: ${title}`}
    >
      <span className="mt-0.5 text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {!isRead && (
            <Badge variant="destructive" className="text-[10px]">
              Nuevo
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
      </div>
      {!isRead && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(notificationId)}
          disabled={isRead}
        >
          Marcar leído
        </Button>
      )}
    </div>
  );
}
