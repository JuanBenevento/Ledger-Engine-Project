"use client";

import React, { useState } from "react";
import { useWallets } from "@/lib/api/hooks/use-wallets";
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
  const [amount, setAmount] = useState<number>(0);

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];

  const activeWalletId = selectedWalletId || wallets[0]?.walletId || "";

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
          onValueChange={setSelectedWalletId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar billetera" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.walletId} value={wallet.walletId ?? ""}>
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
        <PSEBankSelector walletId={activeWalletId} amount={amount} />
      )}
      {method === "cash" && activeWalletId && (
        <CashTopUpResult walletId={activeWalletId} amount={amount} />
      )}
    </div>
  );
}
