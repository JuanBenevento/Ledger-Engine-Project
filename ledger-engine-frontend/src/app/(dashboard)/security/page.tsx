"use client";

import { useDevices } from "@/lib/api/hooks/use-security";
import { TwoFactorSetup } from "@/components/features/security/two-factor-setup";
import { DeviceList } from "@/components/features/security/device-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldIcon, SmartphoneIcon, ActivityIcon } from "lucide-react";

/**
 * Security settings page.
 *
 * Features:
 * - 2FA section with enable/disable
 * - Device list with revoke
 * - Security log shell
 */
export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Seguridad</h1>
        <p className="text-muted-foreground">
          Administra la seguridad de tu cuenta
        </p>
      </div>

      {/* 2FA Section */}
      <TwoFASection />

      {/* Device List */}
      <DeviceListSection />

      {/* Security Log */}
      <SecurityLogSection />
    </div>
  );
}

/**
 * Two-Factor Authentication section.
 */
function TwoFASection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <ShieldIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>Autenticación de dos factores</CardTitle>
          <p className="text-sm text-muted-foreground">
            Añade una capa extra de seguridad a tu cuenta
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <TwoFactorSetup />
      </CardContent>
    </Card>
  );
}

/**
 * Device list section.
 */
function DeviceListSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <SmartphoneIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>Dispositivos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dispositivos con acceso a tu cuenta
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <DeviceList />
      </CardContent>
    </Card>
  );
}

/**
 * Security log section (shell).
 */
function SecurityLogSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <ActivityIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>Registro de actividad</CardTitle>
          <p className="text-sm text-muted-foreground">
            Historial de eventos de seguridad de tu cuenta
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-4">
          Próximamente: registro de actividad de seguridad
        </p>
      </CardContent>
    </Card>
  );
}
