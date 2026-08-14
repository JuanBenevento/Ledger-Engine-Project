"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/hooks/use-currency";
import { formatCurrency } from "@/hooks/use-currency";
import { Wallet, WalletStatus } from "@/types/wallet";
import { cn } from "@/lib/utils";
import { WalletIcon, ArrowRightIcon } from "lucide-react";

interface WalletCardProps {
  wallet: Wallet;
  balance?: number;
  className?: string;
}

/**
 * Status badge color mapping.
 */
const statusConfig: Record<WalletStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Activa", variant: "default" },
  INACTIVE: { label: "Inactiva", variant: "secondary" },
  FROZEN: { label: "Congelada", variant: "destructive" },
};

/**
 * WalletCard molecule.
 *
 * Displays wallet name, balance (COP formatted), status badge,
 * animated balance change, and click-to-detail navigation.
 *
 * Features:
 * - COP formatted balance: "$ 1.234.567"
 * - Animated number transition on balance changes
 * - Status badge with color coding
 * - Click to navigate to wallet detail
 * - Hover effect with arrow indicator
 */
export function WalletCard({ wallet, balance, className }: WalletCardProps) {
  const router = useRouter();
  const status = statusConfig[wallet.status] || statusConfig.ACTIVE;

  const handleClick = () => {
    router.push(`/wallets/${wallet.wallet_id}`);
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/20 hover:shadow-md",
        wallet.status === "INACTIVE" && "opacity-60",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Billetera ${wallet.name}, saldo ${formatCurrency(balance)}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{wallet.name}</CardTitle>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              <AnimatedNumber value={balance ?? 0} />
            </p>
            <p className="text-xs text-muted-foreground">{wallet.currency}</p>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  );
}
