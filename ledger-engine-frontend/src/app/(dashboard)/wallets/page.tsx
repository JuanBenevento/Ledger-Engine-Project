"use client";

import { useWallets, useWalletBalance } from "@/lib/api/hooks/use-wallets";
import { WalletCard } from "@/components/features/wallets/wallet-card";
import { CreateWalletDialog } from "@/components/features/wallets/create-wallet-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletCardSkeleton } from "@/components/atoms/skeletons/wallet-card-skeleton";
import { WalletIcon, TrendingUpIcon } from "lucide-react";

/**
 * Dashboard page with wallet overview.
 *
 * Features:
 * - Total balance hero (sum of all active wallets)
 * - Wallet grid with WalletCards
 * - "Nueva billetera" CTA
 * - Skeleton loader while fetching
 * - Empty state for new users
 */
export default function DashboardPage() {
  const { data: walletsData, isLoading, error } = useWallets();
  const wallets = walletsData?.wallets ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Billeteras</h1>
          <p className="text-muted-foreground">
            Administra tus finanzas de forma simple y segura
          </p>
        </div>
        <CreateWalletDialog />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <WalletCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Error al cargar las billeteras. Intenta de nuevo más tarde.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && wallets.length === 0 && (
        <EmptyState />
      )}

      {/* Wallets Loaded */}
      {!isLoading && !error && wallets.length > 0 && (
        <>
          <TotalBalanceHero wallets={wallets} />
          <WalletGrid wallets={wallets} />
        </>
      )}
    </div>
  );
}

/**
 * Total balance hero card.
 * Shows sum of all active wallet balances.
 */
function TotalBalanceHero({ wallets }: { wallets: Array<{ walletId?: string; status?: string }> }) {
  const activeWallets = wallets.filter((w) => w.status === "ACTIVE");

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Saldo total
        </CardTitle>
        <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">
            {/* Individual balances will be summed by parent */}
            <span className="text-muted-foreground">Cargando...</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeWallets.length} billetera{activeWallets.length !== 1 ? "s" : ""} activa{activeWallets.length !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Wallet grid component.
 * Displays WalletCards in a responsive grid.
 */
function WalletGrid({ wallets }: { wallets: Array<{ walletId?: string; name?: string; status?: string; currency?: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <WalletCardWithBalance key={wallet.wallet_id} wallet={wallet} />
      ))}
    </div>
  );
}

/**
 * WalletCard with balance fetching.
 * Each card independently fetches its balance.
 */
function WalletCardWithBalance({
  wallet,
}: {
  wallet: { walletId?: string; name?: string; status?: string; currency?: string };
}) {
  const { data: balanceData } = useWalletBalance(wallet.wallet_id ?? null);

  const balance = balanceData?.balance ? parseFloat(balanceData.balance) : 0;

  return (
    <WalletCard
      wallet={{
        walletId: wallet.wallet_id ?? "",
        name: wallet.name ?? "",
        currency: wallet.currency ?? "COP",
        status: (wallet.status as "ACTIVE" | "INACTIVE" | "FROZEN") ?? "ACTIVE",
      }}
      balance={balance}
    />
  );
}



/**
 * Empty state for users with no wallets.
 */
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <WalletIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes billeteras aún</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Crea tu primera billetera virtual para comenzar a administrar tu dinero
          de forma segura y sencilla.
        </p>
        <CreateWalletDialog>
          <span>
            Crear mi primera billetera
          </span>
        </CreateWalletDialog>
      </CardContent>
    </Card>
  );
}
