"use client";

import { useState } from "react";
import { useEnable2FA, useVerify2FA } from "@/lib/api/hooks/use-security";
import { OTPInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, DownloadIcon } from "lucide-react";

interface TwoFAData {
  secret: string;
  provisioningUri: string;
  qrCodeUrl: string;
}

interface BackupCodesProps {
  codes: string[];
}

/**
 * Two-Factor Authentication setup component.
 *
 * Flow:
 * 1. Click "Habilitar 2FA" → POST /api/v1/security/2fa/enable → shows QR
 * 2. Scan QR → enter 6-digit code → POST /api/v1/security/2fa/verify
 * 3. On success → shows backup codes (copy/download)
 */
export function TwoFactorSetup() {
  const [twoFAData, setTwoFAData] = useState<TwoFAData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const enableMutation = useEnable2FA();
  const verifyMutation = useVerify2FA();

  const handleEnable = async () => {
    const data = await enableMutation.mutateAsync();
    setTwoFAData(data);
  };

  const handleVerify = async (code: string) => {
    try {
      const result = await verifyMutation.mutateAsync(code);
      setBackupCodes(result.backupCodes);
    } catch {
      // Error handled by the hook's onError callback
    }
  };

  // Step 1: Show enable button
  if (!twoFAData) {
    return (
      <Button
        onClick={handleEnable}
        disabled={enableMutation.isPending}
      >
        {enableMutation.isPending ? "Habilitando..." : "Habilitar 2FA"}
      </Button>
    );
  }

  // Step 2: Show QR code and verification input
  if (!backupCodes) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Escanea el código QR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img
                src={twoFAData.qrCodeUrl}
                alt="QR Code para 2FA"
                className="h-48 w-48"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Usa Google Authenticator o Authy para escanear el código
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Ingresa el código de 6 dígitos:</p>
              <OTPInput
                length={6}
                value={verificationCode}
                onChange={setVerificationCode}
                disabled={verifyMutation.isPending}
              />
            </div>
            <Button
              onClick={() => handleVerify(verificationCode)}
              disabled={verificationCode.length !== 6 || verifyMutation.isPending}
              className="w-full"
            >
              {verifyMutation.isPending ? "Verificando..." : "Verificar código"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Show backup codes
  return <BackupCodesDisplay codes={backupCodes} />;
}

/**
 * Backup codes display with copy and download functionality.
 */
function BackupCodesDisplay({ codes }: BackupCodesProps) {
  const handleCopyAll = async () => {
    const text = codes.join("\n");
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = codes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger-engine-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Códigos de respaldo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Guarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code) => (
            <div
              key={code}
              className="rounded-lg border p-2 text-center font-mono text-sm"
            >
              {code}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyAll} className="flex-1">
            <CopyIcon className="mr-2 h-4 w-4" />
            Copiar todos
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
