"use client";

import { useState } from "react";
import { useDevices, useRevokeDevice } from "@/lib/api/hooks/use-security";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmartphoneIcon } from "lucide-react";

interface Device {
  deviceId: string;
  name: string;
  os: string;
  browser: string;
  lastLoginAt: string;
  isCurrentDevice: boolean;
  trusted: boolean;
}

/**
 * Device list component with revoke functionality.
 *
 * Features:
 * - Displays all trusted devices
 * - Highlights current device with badge
 * - Revoke button with confirmation dialog
 * - Empty state when no devices
 */
export function DeviceList() {
  const { data, isLoading } = useDevices();
  const devices = data?.devices ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay dispositivos registrados
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <DeviceCard key={device.deviceId} device={device} />
      ))}
    </div>
  );
}

/**
 * Individual device card with revoke functionality.
 */
function DeviceCard({ device }: { device: Device }) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const revokeMutation = useRevokeDevice();

  const handleRevoke = async () => {
    await revokeMutation.mutateAsync(device.deviceId);
    setShowRevokeDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <SmartphoneIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{device.name}</p>
              {device.isCurrentDevice && (
                <Badge variant="secondary">Actual</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {device.os} · {device.browser} · Último acceso:{" "}
              {new Date(device.lastLoginAt).toLocaleDateString("es-CO")}
            </p>
          </div>
        </div>
        {!device.isCurrentDevice && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRevokeDialog(true)}
          >
            Revocar
          </Button>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Revocar {device.name}?</DialogTitle>
            <DialogDescription>
              Este dispositivo ya no tendrá acceso a tu cuenta. La próxima vez
              que inicies sesión desde aquí, se te pedirá verificación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevokeDialog(false)}
              disabled={revokeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? "Revocando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
