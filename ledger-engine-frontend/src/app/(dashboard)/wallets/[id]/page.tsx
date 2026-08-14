"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWallets, useWalletBalance, useWalletTransactions, useRenameWallet } from "@/lib/api/hooks/use-wallets";
import { AnimatedNumber } from "@/hooks/use-currency";
import { TransactionHistory } from "@/components/features/wallets/transaction-history";
import { DeactivateWalletDialog } from "@/components/features/wallets/deactivate-wallet-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, WalletStatus } from "@/types/wallet";
import { Loader2, ArrowLeftIcon, MoreVerticalIcon, PencilIcon, TrashIcon, WalletIcon } from "lucide-react";
import Link from "next/link";

/**
 * Status badge color mapping.
 */
const statusConfig: Record<WalletStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Activa", variant: "default" },
  INACTIVE: { label: "Inactiva", variant: "secondary" },
  FROZEN: { label: "Congelada", variant: "destructive" },
};

/**
 * WalletDetailPage component.
 *
 * Displays detailed wallet information with:
 * - Balance hero with animated number
 * - Actions menu (rename, deactivate)
 * - Transaction history with infinite scroll
 */
export default function WalletDetailPage() {
  const params = useParams();
  const walletId = params.id as string;

  const [renameOpen, setRenameOpen] = useState(false);

  const { data: walletsData, isLoading: isLoadingWallets } = useWallets();
  const { data: balanceData, isLoading: isLoadingBalance } = useWalletBalance(walletId);
  const { data: transactionsData, isLoading: isLoadingTransactions } = useWalletTransactions(walletId);

  const wallet = walletsData?.wallets?.find((w) => w.wallet_id === walletId);
  const balance = balanceData?.balance ? parseFloat(balanceData.balance) : 0;
  const status = wallet?.status as WalletStatus || "ACTIVE";
  const statusConfig_ = statusConfig[status] || statusConfig.ACTIVE;

  // Loading state
  if (isLoadingWallets || isLoadingBalance) {
    return <WalletDetailSkeleton />;
  }

  // Wallet not found
  if (!wallet) {
    return (
      <div className="space-y-6">
        <Link href="/wallets" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Volver
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Billetera no encontrada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/wallets" className={buttonVariants({ variant: "ghost" })}>
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Volver
      </Link>

      {/* Balance Hero */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{wallet.name}</CardTitle>
            <Badge variant={statusConfig_.variant}>{statusConfig_.label}</Badge>
          </div>
          <ActionsMenu wallet={wallet} balance={balance} onRename={() => setRenameOpen(true)} />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              <AnimatedNumber value={balance} />
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{wallet.currency}</p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <TransactionHistory
        transactions={transactionsData?.content ?? []}
        isLoading={isLoadingTransactions}
      />

      {/* Rename Dialog */}
      <RenameWalletDialog
        wallet={wallet}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
    </div>
  );
}

/**
 * Actions dropdown menu for wallet detail.
 */
function ActionsMenu({
  wallet,
  balance,
  onRename,
}: {
  wallet: Wallet;
  balance: number;
  onRename: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRename}>
          <PencilIcon className="mr-2 h-4 w-4" />
          Renombrar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DeactivateWalletDialog wallet={wallet} balance={balance}>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => e.preventDefault()}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Desactivar
          </DropdownMenuItem>
        </DeactivateWalletDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Rename wallet dialog.
 */
function RenameWalletDialog({
  wallet,
  open,
  onOpenChange,
}: {
  wallet: Wallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(wallet.name);
  const renameWallet = useRenameWallet();

  const handleRename = async () => {
    if (!name.trim() || name === wallet.name) {
      onOpenChange(false);
      return;
    }

    try {
      await renameWallet.mutateAsync({
        walletId: wallet.wallet_id,
        name: name.trim(),
      });
      onOpenChange(false);
    } catch {
      // Error handled by useRenameWallet hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renombrar billetera</DialogTitle>
          <DialogDescription>
            Cambia el nombre de tu billetera para identificarla mejor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Nombre</Label>
            <Input
              id="wallet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la billetera"
              disabled={renameWallet.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={renameWallet.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleRename}
            disabled={renameWallet.isPending || !name.trim() || name === wallet.name}
          >
            {renameWallet.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Skeleton loader for wallet detail page.
 */
function WalletDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-24" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-12" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
