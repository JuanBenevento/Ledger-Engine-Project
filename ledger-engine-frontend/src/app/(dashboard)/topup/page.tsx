"use client";

import React, { useState } from "react";
import { useWallets } from "@/lib/api/hooks/use-wallets";
import { useCashTopUp } from "@/lib/api/hooks/use-topups";
import { CardTopUpForm } from "@/components/features/topup/card-top-up-form";
import { PSEBankSelector } from "@/components/features/topup/pse-bank-selector";
import { CashTopUpResult } from "@/components/features/topup/cash-top-up-result";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCardIcon, BuildingIcon, BanknoteIcon } from "lucide-react";

type TopUpMethod = "card" | "pse" | "cash";

const methods: Array<{ id: TopUpMethod; label: string; icon: React.ReactNode }> = [
  { id: "card", label: "Tarjeta", icon: React.createElement(CreditCardIcon, { className: "h-5 w-5" }) },
  { id: "pse", label: "PSE", icon: React.createElement(BuildingIcon, { className: "h-5 w-5" }) },
  { id: "cash", label: "Efectivo", icon: React.createElement(BanknoteIcon, { className: "h-5 w-5" }) },
];

/**
 * TopUp page.
 *
 * Features:
 * - Method selector with 3 cards (Tarjeta, PSE, Efectivo)
 * - Wallet selector dropdown using useWallets hook
 * - Amount input (min 1,000 / max 10,000,000 COP)
 * - Shows appropriate form based on selected method
 */
export default function TopUpPage() {
  const [method, setMethod] = useState<TopUpMethod>("card");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [cashTopUpResult, setCashTopUpResult] = useState<{
    topUpId: string;
    referenceCode: string;
    expiresAt: string;
  } | null>(null);

  const cashTopUpMutation = useCashTopUp();

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];

  const activeWalletId = selectedWalletId || wallets[0]?.wallet_id || "";

  const handleCashTopUp = async () => {
    if (!activeWalletId || amount <= 0) return;
    try {
      const result = await cashTopUpMutation.mutateAsync({
        walletId: activeWalletId,
        amount,
      });
      const data = result as Record<string, unknown>;
      setCashTopUpResult({
        topUpId: (data.topUpId ?? data.id ?? "") as string,
        referenceCode: (data.referenceCode ?? data.reference ?? "") as string,
        expiresAt: (data.expiresAt ?? data.expires_at ?? new Date(Date.now() + 3600000).toISOString()) as string,
      });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recargar billetera</h1>
        <p className="text-muted-foreground">
          Elige un método de pago para recargar tu billetera
        </p>
      </div>

      {/* Method Selector */}
      <div className="grid gap-4 sm:grid-cols-3">
        {methods.map((m) => (
          <Card
            key={m.id}
            className={`cursor-pointer transition-colors ${
              method === m.id
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => setMethod(m.id)}
            data-testid={`method-${m.id}`}
          >
            <CardContent className="flex items-center gap-3 py-4">
              {m.icon}
              <span className="font-medium">{m.label}</span>
            </CardContent>
          </Card>
        ))}
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

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="topup-amount">Monto a recargar</Label>
        <Input
          id="topup-amount"
          type="number"
          placeholder="Ej: 50000"
          min={1000}
          max={10000000}
          step={1000}
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      {/* Method Forms */}
      {method === "card" && activeWalletId && (
        <CardTopUpForm walletId={activeWalletId} amount={amount} />
      )}
      {method === "pse" && activeWalletId && (
        <PSEBankSelector onSelect={(bank) => setSelectedBankId(bank.id)} disabled={false} selectedBankId={selectedBankId} />
      )}
      {method === "cash" && activeWalletId && !cashTopUpResult && (
        <button
          onClick={handleCashTopUp}
          disabled={cashTopUpMutation.isPending || amount <= 0}
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {cashTopUpMutation.isPending ? "Generando referencia..." : "Generar referencia de pago"}
        </button>
      )}
      {method === "cash" && cashTopUpResult && (
        <CashTopUpResult
          topUpId={cashTopUpResult.topUpId}
          referenceCode={cashTopUpResult.referenceCode}
          expiresAt={cashTopUpResult.expiresAt}
          amount={amount}
          onSuccess={() => setCashTopUpResult(null)}
        />
      )}
    </div>
  );
}
