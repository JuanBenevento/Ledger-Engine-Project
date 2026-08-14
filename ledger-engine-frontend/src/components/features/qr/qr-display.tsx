"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ShareIcon, ClockIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

interface QRDisplayProps {
  qrCodeId: string;
  qrImageBase64: string;
  amount?: number;
  currency?: string;
  description?: string;
  expiresAt: string;
}

function getTimeRemaining(expiresAt: string): { minutes: number; seconds: number; total: number } {
  const total = new Date(expiresAt).getTime() - Date.now();
  if (total <= 0) return { minutes: 0, seconds: 0, total: 0 };
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { minutes, seconds, total };
}

function formatTime(minutes: number, seconds: number): string {
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * QRDisplay component.
 *
 * Features:
 * - QR code image (base64 from API response)
 * - 15min countdown timer (from expiresAt)
 * - Download button (saves as PNG)
 * - Native share button (Web Share API)
 * - Expiry warning when < 2 minutes remaining
 * - Success state message
 */
export function QRDisplay({
  qrCodeId,
  qrImageBase64,
  amount,
  currency: _currency,
  expiresAt,
}: QRDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpiringSoon = timeRemaining.total > 0 && timeRemaining.total < 120000;

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = qrImageBase64;
    link.download = `qr-${qrCodeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrImageBase64, qrCodeId]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Código QR de pago",
          text: amount
            ? `Escanea para pagar ${formatCurrency(amount)}`
            : "Escanea para pagar",
        });
      } catch {
        // User cancelled or share failed
      }
    }
  }, [amount]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Success message */}
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircleIcon className="h-5 w-5" />
        <span className="font-medium">QR generado exitosamente</span>
      </div>

      {/* QR Image */}
      <div className="rounded-lg border bg-white p-4">
        <img
          src={qrImageBase64}
          alt="Código QR"
          className="h-48 w-48"
        />
      </div>

      {/* Amount display */}
      {amount !== undefined && amount !== null && (
        <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
      )}

      {/* Countdown timer */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <ClockIcon className="h-4 w-4" />
        <span className="text-sm">
          Tiempo restante: {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
        </span>
      </div>

      {/* Expiry warning */}
      {isExpiringSoon && (
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">El QR expira pronto</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleDownload}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Descargar QR
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <ShareIcon className="mr-2 h-4 w-4" />
          Compartir
        </Button>
      </div>
    </div>
  );
}
