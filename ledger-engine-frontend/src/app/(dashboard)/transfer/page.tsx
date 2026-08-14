"use client";

import React, { useState } from "react";
import { useWallets } from "@/lib/api/hooks/use-wallets";
import { RecipientSearch } from "@/components/features/transfer/recipient-search";
import { TransferConfirmationDialog } from "@/components/features/transfer/transfer-confirmation-dialog";
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

interface Recipient {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
}

/**
 * Transfer page.
 *
 * Features:
 * - RecipientSearch component for email/phone input
 * - Amount input (min 1,000 COP, formatted)
 * - Source wallet selector (dropdown using useWallets hook)
 * - Submit button -> opens TransferConfirmationDialog
 * - Uses useState for recipient, amount, sourceWallet
 */
export default function TransferPage() {
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [sourceWalletId, setSourceWalletId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];

  const activeWalletId = sourceWalletId || wallets[0]?.wallet_id || "";

  const canSubmit = recipient !== null && amount >= 1000 && activeWalletId !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transferir dinero</h1>
        <p className="text-muted-foreground">
          Envía dinero de forma rápida y segura a cualquier persona
        </p>
      </div>

      {/* Recipient Search */}
      <div className="space-y-2">
        <Label>Destinatario</Label>
        <RecipientSearch onSelect={setRecipient} />
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="transfer-amount">Monto a transferir</Label>
        <Input
          id="transfer-amount"
          type="number"
          placeholder="Ej: 50000"
          min={1000}
          step={1000}
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <p className="text-sm text-muted-foreground">Mínimo $ 1.000 COP</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="transfer-description">Descripción (opcional)</Label>
        <Input
          id="transfer-description"
          type="text"
          placeholder="Ej: Pago de almuerzo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Source Wallet Selector */}
      <div className="space-y-2">
        <Label>Seleccionar billetera de origen</Label>
        <Select
          value={activeWalletId}
          onValueChange={(v) => setSourceWalletId(v ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar billetera de origen" />
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

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
        size="lg"
      >
        Continuar
      </Button>

      {/* Confirmation Dialog */}
      {recipient && (
        <TransferConfirmationDialog
          open={showConfirmation}
          onClose={handleConfirmationClose}
          recipient={recipient}
          amount={amount}
          sourceWalletId={activeWalletId}
          description={description}
        />
      )}
    </div>
  );
}
