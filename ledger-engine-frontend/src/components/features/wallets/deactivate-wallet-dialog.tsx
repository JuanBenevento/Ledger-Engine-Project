"use client";

import { useState } from "react";
import { Loader2, AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeactivateWallet } from "@/lib/api/hooks/use-wallets";
import { formatCurrency } from "@/hooks/use-currency";
import { Wallet } from "@/types/wallet";

interface DeactivateWalletDialogProps {
  wallet: Wallet;
  balance?: number;
  children?: React.ReactNode;
}

/**
 * DeactivateWalletDialog molecule.
 *
 * Confirmation dialog for deactivating a wallet.
 *
 * Features:
 * - Shows wallet name and current balance
 * - Blocks if balance > 0
 * - POST /api/v1/wallets/{id}/deactivate
 * - Handle 422 WALLET_HAS_BALANCE error
 * - Success toast
 * - Query invalidation
 */
export function DeactivateWalletDialog({
  wallet,
  balance = 0,
  children,
}: DeactivateWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const deactivateWallet = useDeactivateWallet();

  const hasBalance = balance > 0;

  const handleDeactivate = async () => {
    if (hasBalance) return;

    try {
      await deactivateWallet.mutateAsync(wallet.walletId);
      setOpen(false);
    } catch {
      // Error handled by useDeactivateWallet hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children ?? <Button variant="destructive" size="sm" disabled={hasBalance}>Desactivar</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            Desactivar billetera
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas desactivar la billetera &quot;{wallet.name}&quot;?
          </DialogDescription>
        </DialogHeader>

        {hasBalance && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              Saldo pendiente
            </p>
            <p className="text-sm text-amber-700">
              Transfiere el saldo de {formatCurrency(balance)} antes de desactivar
              esta billetera.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deactivateWallet.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeactivate}
            disabled={hasBalance || deactivateWallet.isPending}
          >
            {deactivateWallet.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desactivando...
              </>
            ) : (
              "Desactivar billetera"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
