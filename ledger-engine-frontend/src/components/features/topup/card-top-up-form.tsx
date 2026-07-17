"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCardTopUp } from "@/lib/api/hooks/use-topups";
import { formatCurrency } from "@/hooks/use-currency";

interface CardTopUpFormProps {
  walletId: string;
  amount: number;
}

/**
 * Formats a raw number string into card number format with spaces.
 * "4111111111111111" → "4111 1111 1111 1111"
 */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * CardTopUpForm molecule.
 *
 * Form for topping up a wallet with a credit/debit card.
 *
 * Features:
 * - Card number input with formatting (XXXX XXXX XXXX XXXX)
 * - Expiry date input (MM/YY)
 * - CVV input (password type)
 * - Amount display from parent
 * - Loading state with spinner
 * - Success/error toasts via hook
 */
export function CardTopUpForm({ walletId, amount }: CardTopUpFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const cardTopUp = useCardTopUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    cardTopUp.mutate({
      walletId,
      data: {
        amount: String(amount),
        currency: "COP",
        cardToken: cardNumber.replace(/\s/g, ""),
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Número de tarjeta</Label>
            <Input
              id="card-number"
              placeholder="XXXX XXXX XXXX XXXX"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              disabled={cardTopUp.isPending}
              autoComplete="cc-number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Fecha de expiración</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                disabled={cardTopUp.isPending}
                autoComplete="cc-exp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="***"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                maxLength={3}
                disabled={cardTopUp.isPending}
                autoComplete="cc-csc"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Monto a recargar</p>
            <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={cardTopUp.isPending || amount === 0}
          >
            {cardTopUp.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recargando...
              </>
            ) : (
              "Recargar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
