"use client";

import React, { useState } from "react";
import { useWallets } from "@/lib/api/hooks/use-wallets";
import { BillerSearch } from "@/components/features/bills/biller-search";
import { BillFavoritesList } from "@/components/features/bills/bill-favorites-list";
import { BillPaymentForm } from "@/components/features/bills/bill-payment-form";
import type { Biller } from "@/lib/api/hooks/use-bills";

/**
 * BillPaymentPage.
 *
 * Features:
 * - BillerSearch component for searching billers
 * - BillFavoritesList for quick access to favorite billers
 * - BillPaymentForm for entering payment details
 * - Uses useState for selected biller
 */
export default function BillPaymentPage() {
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];
  const activeWalletId = wallets[0]?.walletId || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagar factura</h1>
        <p className="text-muted-foreground">
          Busca y paga tus facturas de servicios públicos
        </p>
      </div>

      {/* Favorites List */}
      <BillFavoritesList onSelect={setSelectedBiller} />

      {/* Biller Search */}
      <BillerSearch onSelect={setSelectedBiller} />

      {/* Payment Form (shown after biller selection) */}
      {selectedBiller && activeWalletId && (
        <BillPaymentForm
          billerId={selectedBiller.id}
          walletId={activeWalletId}
        />
      )}
    </div>
  );
}
