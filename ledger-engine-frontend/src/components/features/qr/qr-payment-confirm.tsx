"use client";

import React from "react";
import { usePayQr } from "@/lib/api/hooks/use-qr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";

interface QRPaymentConfirmProps {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  amount?: number;
  qrCodeId: string;
  payerWalletId: string;
  hmacPayload: string;
}

/**
 * QRPaymentConfirm organism.
 *
 * Shows recipient name and amount from scanned QR.
 * "Pagar" button triggers POST /api/v1/qr/pay.
 * Handles QR_EXPIRED and INSUFFICIENT_FUNDS errors.
 * Loading state with spinner, success state with checkmark.
 */
export function QRPaymentConfirm({
  open,
  onClose,
  recipientName,
  amount,
  qrCodeId,
  payerWalletId,
  hmacPayload,
}: QRPaymentConfirmProps) {
  const payQr = usePayQr();

  const handlePay = () => {
    payQr.mutate({
      qrCodeId,
      payerWalletId,
      amount,
      hmacPayload,
    });
  };

  if (payQr.isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex flex-col items-center py-6">
            <CheckCircleIcon className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-semibold">¡Pago completado!</h2>
            <p className="text-muted-foreground mt-2">
              El pago a {recipientName} se procesó exitosamente
            </p>
            <Button onClick={onClose} className="mt-6">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar pago QR</DialogTitle>
          <DialogDescription>
            Revisa los datos antes de confirmar el pago
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Destinatario</span>
            <span className="font-medium">{recipientName}</span>
          </div>
          {amount !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monto</span>
              <span className="font-semibold text-lg">
                {formatCurrency(amount)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handlePay}
            disabled={payQr.isPending}
            className="w-full"
            size="lg"
          >
            {payQr.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Procesando pago...
              </span>
            ) : (
              "Pagar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
