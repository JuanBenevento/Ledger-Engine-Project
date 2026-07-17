"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTransfer } from "@/lib/api/hooks/use-transfers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/hooks/use-currency";
import { Loader2Icon, AlertTriangleIcon } from "lucide-react";

interface Recipient {
  userId: string;
  name: string;
  email: string;
}

interface TransferConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  recipient: Recipient;
  amount: number;
  sourceWalletId: string;
  description: string;
}

/**
 * TransferConfirmationDialog molecule.
 *
 * Shows summary: recipient name, amount (COP formatted), description, source wallet.
 * "Confirmar" button -> calls transfer mutation.
 * Duplicate transfer warning (10s window) — show warning if same recipient within 10s.
 * Loading state with spinner.
 * Success toast "Transferencia enviada".
 */
export function TransferConfirmationDialog({
  open,
  onClose,
  recipient,
  amount,
  sourceWalletId,
  description,
}: TransferConfirmationDialogProps) {
  const transfer = useTransfer();
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const lastTransferRef = useRef<{ recipientId: string; timestamp: number } | null>(null);

  useEffect(() => {
    if (open) {
      const last = lastTransferRef.current;
      if (last && last.recipientId === recipient.userId) {
        const timeDiff = Date.now() - last.timestamp;
        if (timeDiff < 10_000) {
          setShowDuplicateWarning(true);
          return;
        }
      }
      setShowDuplicateWarning(false);
    }
  }, [open, recipient.userId]);

  const handleConfirm = () => {
    transfer.mutate(
      {
        recipientEmail: recipient.email,
        amount,
        walletId: sourceWalletId,
        description,
      },
      {
        onSuccess: () => {
          lastTransferRef.current = {
            recipientId: recipient.userId,
            timestamp: Date.now(),
          };
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar transferencia</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de enviar tu transferencia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Destinatario</span>
            <span className="font-medium">{recipient.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Monto</span>
            <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
          </div>

          {description && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Descripción</span>
              <span>{description}</span>
            </div>
          )}
        </div>

        {showDuplicateWarning && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            <AlertTriangleIcon className="h-4 w-4 flex-shrink-0" />
            <span>Ya enviaste una transferencia reciente a este destinatario</span>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={transfer.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={transfer.isPending}
          >
            {transfer.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
