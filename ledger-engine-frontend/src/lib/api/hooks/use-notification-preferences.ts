"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";

/** Notification preference type for a specific notification type and channel. */
export interface NotificationPreference {
  type: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

/**
 * Hook to fetch notification preferences.
 *
 * GET /api/v1/notifications/preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data, error } = await api.GET(
        "/api/v1/notifications/preferences"
      );

      if (error) {
        throw error;
      }

      return (data ?? { preferences: [] }) as {
        preferences: NotificationPreference[];
      };
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to update notification preferences.
 *
 * PUT /api/v1/notifications/preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: NotificationPreference[]) => {
      const { data, error } = await api.PUT(
        "/api/v1/notifications/preferences",
        {
          body: { preferences },
        }
      );

      if (error) {
        throw error;
      }

      return (data ?? { updated: [] }) as { updated: NotificationPreference[] };
    },
    onSuccess: () => {
      toast.success("Preferencias actualizadas", {
        description: "Tus preferencias de notificación han sido guardadas",
      });
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudieron guardar las preferencias",
      });
    },
  });
}