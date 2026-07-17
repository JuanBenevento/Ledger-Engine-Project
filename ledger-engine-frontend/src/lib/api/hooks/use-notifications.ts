"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";
import type { components } from "../types/api";

type NotificationResponse = components["schemas"]["NotificationResponse"];

/** Notification types mapped to display icons. */
export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  TOPUP_COMPLETED: "💰",
  P2P_RECEIVED: "📩",
  BILL_PAID: "🧾",
  SECURITY_ALERT: "🔒",
};

/** Notification types mapped to human-readable labels. */
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  TOPUP_COMPLETED: "Recarga",
  P2P_RECEIVED: "Transferencia",
  BILL_PAID: "Pago de servicio",
  SECURITY_ALERT: "Alerta de seguridad",
};

/**
 * Hook to fetch notification inbox.
 *
 * GET /api/v1/notifications
 * Paginated (50 per page), with unreadCount in response.
 */
export function useNotifications(page: number = 0, size: number = 50) {
  return useQuery({
    queryKey: ["notifications", page, size],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/v1/notifications", {
        params: { query: { page, size } },
      });

      if (error) {
        throw error;
      }

      return (data ?? { content: [], unreadCount: 0 }) as {
        content: NotificationResponse[];
        unreadCount: number;
      };
    },
    staleTime: 10_000, // 10 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch unread notification count only.
 *
 * Used by NotificationBell for lightweight badge updates.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/v1/notifications", {
        params: { query: { page: 0, size: 0 } },
      });

      if (error) {
        throw error;
      }

      return (data ?? { unreadCount: 0 }) as { unreadCount: number };
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to mark a single notification as read.
 *
 * PUT /api/v1/notifications/{id}/read
 * Optimistic update: decrement unreadCount immediately.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await api.PUT(
        "/api/v1/notifications/{id}/read",
        {
          params: { path: { id: notificationId } },
        }
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onMutate: async (notificationId) => {
      // Optimistic update: decrement unread count
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousData = queryClient.getQueryData(["notifications", "unread-count"]);

      queryClient.setQueryData(
        ["notifications", "unread-count"],
        (old: { unreadCount: number } | undefined) => ({
          unreadCount: Math.max(0, (old?.unreadCount ?? 1) - 1),
        })
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousData
        );
      }
      toast.error("Error", {
        description: "No se pudo marcar como leída",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Hook to mark all notifications as read.
 *
 * POST /api/v1/notifications/read-all
 * Sets unreadCount to 0 optimistically.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST(
        "/api/v1/notifications/read-all"
      );

      if (error) {
        throw error;
      }

      return (data ?? { markedCount: 0 }) as { markedCount: number };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousData = queryClient.getQueryData(["notifications", "unread-count"]);

      queryClient.setQueryData(
        ["notifications", "unread-count"],
        { unreadCount: 0 }
      );

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success("Notificaciones marcadas", {
        description: `${data.markedCount} notificaciones marcadas como leídas`,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousData
        );
      }
      toast.error("Error", {
        description: "No se pudieron marcar todas como leídas",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
