"use client";

import React, { useState } from "react";
import { useWallets } from "@/lib/api/hooks/use-wallets";
import { BillerSearch } from "@/components/features/bills/biller-search";
import { BillFavoritesList } from "@/components/features/bills/bill-favorites-list";
import { BillPaymentForm } from "@/components/features/bills/bill-payment-form";

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
  const [selectedBillerId, setSelectedBillerId] = useState<string | null>(null);

  const { data: walletsData } = useWallets();
  const wallets = walletsData?.wallets ?? [];
  const activeWalletId = wallets[0]?.wallet_id || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagar factura</h1>
        <p className="text-muted-foreground">
          Busca y paga tus facturas de servicios públicos
        </p>
      </div>

      {/* Favorites List */}
      <BillFavoritesList onSelect={setSelectedBillerId} />

      {/* Biller Search */}
      <BillerSearch onSelect={(biller) => setSelectedBillerId(biller.id)} />

      {/* Payment Form (shown after biller selection) */}
      {selectedBillerId && activeWalletId && (
        <BillPaymentForm
          billerId={selectedBillerId}
          walletId={activeWalletId}
        />
      )}
    </div>
  );
}
