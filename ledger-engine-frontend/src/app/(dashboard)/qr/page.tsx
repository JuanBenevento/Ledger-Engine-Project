"use client";

import React, { useState } from "react";
import { useWallets } from "@/lib/api/hooks/use-wallets";
import { useGenerateQr } from "@/lib/api/hooks/use-qr";
import { QRDisplay } from "@/components/features/qr/qr-display";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QrCodeIcon } from "lucide-react";
import type { components } from "@/lib/api/types/api";

type GenerateQrResponse = components["schemas"]["GenerateQrResponse"];

/**
 * QRGeneratePage.
 *
 * Features:
 * - Amount input (optional — for dynamic QR, leave empty for open amount)
 * - Wallet selector (dropdown using useWallets hook)
 * - "Generar QR" button → POST /api/v1/qr/generate
 * - On success, show QRDisplay component
 * - Uses useState for amount, wallet
 */
export default function QRGeneratePage() {
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];
  const activeWalletId = selectedWalletId || wallets[0]?.wallet_id || "";

  const generateQr = useGenerateQr();

  const handleGenerate = () => {
    if (!activeWalletId) return;

    generateQr.mutate({
      walletId: activeWalletId,
      amount: amount !== "" ? Number(amount) : undefined,
      currency: "COP",
    });
  };

  const qrData = generateQr.data as GenerateQrResponse | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generar código QR</h1>
        <p className="text-muted-foreground">
          Crea un código QR para recibir pagos
        </p>
      </div>

      {/* QR Display after generation */}
      {qrData?.qrCodeId && (
        <QRDisplay
          qrCodeId={qrData.qrCodeId}
          qrImageBase64={qrData.qrImageBase64 || ""}
          amount={qrData.amount ? Number(qrData.amount) : undefined}
          currency={qrData.currency}
          expiresAt={qrData.expiresAt || new Date(Date.now() + 900000).toISOString()}
        />
      )}

      {/* Form - only show when no QR generated yet */}
      {!qrData?.qrCodeId && (
        <>
          {/* Amount Input (optional) */}
          <div className="space-y-2">
            <Label htmlFor="qr-amount">Monto (opcional)</Label>
            <Input
              id="qr-amount"
              type="number"
              placeholder="Ej: 50000"
              min={1000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            />
            <p className="text-sm text-muted-foreground">
              Déjalo vacío para un QR de monto abierto
            </p>
          </div>

          {/* Wallet Selector */}
          <div className="space-y-2">
            <Label>Seleccionar billetera</Label>
            <Select
              value={activeWalletId}
              onValueChange={(value) => setSelectedWalletId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar billetera" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.wallet_id} value={wallet.wallet_id ?? ""}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!activeWalletId || generateQr.isPending}
            className="w-full"
            size="lg"
          >
            <QrCodeIcon className="mr-2 h-5 w-5" />
            {generateQr.isPending ? "Generando..." : "Generar QR"}
          </Button>
        </>
      )}
    </div>
  );
}
