"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallets } from "@/lib/api/hooks/use-wallets";
import { usePayBill } from "@/lib/api/hooks/use-bills";
import { formatCurrency } from "@/hooks/use-currency";

interface BillPaymentFormProps {
  billerId: string;
  walletId: string;
}

export function BillPaymentForm({ billerId, walletId }: BillPaymentFormProps) {
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(walletId);

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];

  const payBill = usePayBill();

  const canSubmit = reference.length >= 6 && amount >= 1000 && selectedWalletId !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    payBill.mutate({
      billerId,
      walletId: selectedWalletId,
      amount,
      reference,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference-number">Número de referencia</Label>
            <Input
              id="reference-number"
              type="text"
              placeholder="Ej: 123456789"
              value={reference}
              onChange={(e) => setReference(e.target.value.replace(/\D/g, "").slice(0, 20))}
              disabled={payBill.isPending}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-amount">Monto a pagar</Label>
            <Input
              id="bill-amount"
              type="number"
              placeholder="Ej: 50000"
              min={1000}
              step={1000}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={payBill.isPending}
            />
            <p className="text-sm text-muted-foreground">Mínimo $ 1.000 COP</p>
          </div>

          {/* Wallet Selector */}
          <div className="space-y-2">
            <Label>Seleccionar billetera</Label>
            <Select
              value={selectedWalletId}
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

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Monto a pagar</p>
            <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || payBill.isPending}
          >
            {payBill.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
