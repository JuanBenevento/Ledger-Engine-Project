"use client";

import { useState, useEffect } from "react";
import { CopyIcon, CheckIcon, ClockIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirmCashTopUp } from "@/lib/api/hooks/use-topups";

interface CashTopUpResultProps {
  topUpId: string;
  referenceCode: string;
  expiresAt: string;
  amount: number;
  onSuccess?: () => void;
}

function formatCOP(value: number): string {
  return `$ ${value.toLocaleString("es-CO")}`;
}

function getTimeRemaining(expiresAt: string): string {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return "Expirado";

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

/**
 * CashTopUpResult molecule.
 *
 * Displays cash top-up result with:
 * - Reference number (copyable)
 * - Payment instructions
 * - Expiry countdown timer
 * - Confirm payment button
 * - Success state after confirmation
 */
export function CashTopUpResult({
  topUpId,
  referenceCode,
  expiresAt,
  amount,
  onSuccess,
}: CashTopUpResultProps) {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(expiresAt));
  const confirmMutation = useConfirmCashTopUp();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(expiresAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(topUpId);
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  };

  if (confirmMutation.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pago confirmado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tu recarga ha sido procesada exitosamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recarga en efectivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Monto a pagar</p>
          <p className="text-2xl font-bold">{formatCOP(amount)}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Número de referencia</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
              {referenceCode}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label="Copiar código de referencia"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm font-medium">Paga en Baloto o Efecty</p>
          <p className="text-xs text-muted-foreground">
            Presenta este código en cualquier punto de pago autorizado.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4" />
          <span>
            Vencimiento: <strong>{timeRemaining}</strong>
          </span>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={confirmMutation.isPending}
          className="w-full"
        >
          {confirmMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            "Ya pagué"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
