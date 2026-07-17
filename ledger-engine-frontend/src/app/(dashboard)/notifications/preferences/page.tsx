"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/api/hooks/use-notification-preferences";
import { toast } from "sonner";

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  TOPUP_COMPLETED: "Recarga",
  P2P_RECEIVED: "Transferencia",
  BILL_PAID: "Pago de servicio",
  SECURITY_ALERT: "Alerta de seguridad",
};

const CHANNEL_LABELS = {
  push: "Push",
  email: "Email",
  sms: "SMS",
} as const;

const SECURITY_ALERT_TOOLTIP =
  "Las alertas de seguridad no se pueden desactivar";

interface PreferenceToggle {
  type: string;
  channel: "push" | "email" | "sms";
  enabled: boolean;
  disabled: boolean;
  tooltip?: string;
}

/**
 * NotificationPreferencesPage
 *
 * Toggle grid for notification preferences (type × channel).
 * SECURITY_ALERT toggles are always enabled with tooltip.
 */
export default function NotificationPreferencesPage() {
  const { data, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const preferences = data?.preferences ?? [];
  const [localPreferences, setLocalPreferences] = useState<
    Array<{ type: string; push: boolean; email: boolean; sms: boolean }>
  >([]);

  // Sync local state with fetched data
  if (preferences.length > 0 && localPreferences.length === 0) {
    setLocalPreferences([...preferences]);
  }

  const handleToggle = (
    type: string,
    channel: "push" | "email" | "sms"
  ) => {
    if (type === "SECURITY_ALERT") return; // Cannot disable security alerts

    setLocalPreferences((prev) =>
      prev.map((pref) =>
        pref.type === type ? { ...pref, [channel]: !pref[channel] } : pref
      )
    );
  };

  const handleSave = async () => {
    try {
      await updatePreferences.mutateAsync({ preferences: localPreferences });
      toast.success("Preferencias guardadas");
    } catch {
      toast.error("Error", { description: "No se pudieron guardar las preferencias" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <p className="text-sm text-muted-foreground">Cargando preferencias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preferencias de notificación</h1>
        <p className="text-sm text-muted-foreground">
          Configura cómo quieres recibir tus notificaciones
        </p>
      </div>

      {/* Preferences grid */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Tipo
              </th>
              {Object.values(CHANNEL_LABELS).map((channel) => (
                <th
                  key={channel}
                  className="px-4 py-3 text-center text-sm font-medium"
                >
                  {channel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localPreferences.map((pref) => (
              <tr key={pref.type} className="border-b last:border-b-0">
                <td className="px-4 py-3 text-sm">
                  {NOTIFICATION_TYPE_LABELS[pref.type] ?? pref.type}
                </td>
                {(Object.keys(CHANNEL_LABELS) as Array<"push" | "email" | "sms">).map(
                  (channel) => {
                    const isSecurityAlert = pref.type === "SECURITY_ALERT";
                    const isEnabled = pref[channel];

                    return (
                      <td key={channel} className="px-4 py-3 text-center">
                        <span
                          title={
                            isSecurityAlert ? SECURITY_ALERT_TOOLTIP : undefined
                          }
                        >
                          <Checkbox
                            checked={isEnabled}
                            onCheckedChange={() =>
                              handleToggle(pref.type, channel)
                            }
                            disabled={isSecurityAlert}
                            aria-label={`${NOTIFICATION_TYPE_LABELS[pref.type]} ${channel}`}
                          />
                        </span>
                      </td>
                    );
                  }
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updatePreferences.isPending}>
          {updatePreferences.isPending ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </div>
    </div>
  );
}
