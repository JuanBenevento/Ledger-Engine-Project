"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/atoms/skeletons/table-skeleton";
import { formatCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import {
  CreditCardIcon,
  BuildingIcon,
  BanknoteIcon,
  WalletIcon,
  Loader2Icon,
} from "lucide-react";

interface TopUp {
  topUpId: string;
  walletId: string;
  amount: number;
  currency: string;
  method: "CARD" | "PSE" | "CASH";
  status: "COMPLETED" | "PENDING" | "FAILED";
  referenceCode?: string;
  createdAt: string;
}

interface TopUpHistoryProps {
  topUps: TopUp[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * TopUp method configuration.
 */
const methodConfig: Record<
  TopUp["method"],
  { label: string; icon: React.ElementType; color: string }
> = {
  CARD: {
    label: "Tarjeta",
    icon: CreditCardIcon,
    color: "text-blue-500",
  },
  PSE: {
    label: "PSE",
    icon: BuildingIcon,
    color: "text-violet-500",
  },
  CASH: {
    label: "Efectivo",
    icon: BanknoteIcon,
    color: "text-emerald-500",
  },
};

/**
 * TopUp status configuration.
 */
const statusConfig: Record<
  TopUp["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  COMPLETED: { label: "Completado", variant: "default" },
  PENDING: { label: "Pendiente", variant: "secondary" },
  FAILED: { label: "Fallido", variant: "destructive" },
};

/**
 * Format date in es-CO locale.
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time in es-CO locale.
 */
function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * TopUpHistory organism.
 *
 * Paginated top-up table with:
 * - Method icons (CARD, PSE, CASH)
 * - Status badges
 * - "Load more" button
 * - COP formatted amounts
 * - Date formatting (es-CO locale)
 */
export function TopUpHistory({
  topUps,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: TopUpHistoryProps) {
  if (isLoading && topUps.length === 0) {
    return <TableSkeleton rows={3} className={className} />;
  }

  if (topUps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay recargas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historial de recargas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topUps.map((topUp) => (
            <TopUpRow key={topUp.topUpId} topUp={topUp} />
          ))}

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={onLoadMore}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Loader2Icon className="h-4 w-4" />
                Cargar más
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Single top-up row component.
 */
function TopUpRow({ topUp }: { topUp: TopUp }) {
  const method = methodConfig[topUp.method] || methodConfig.CARD;
  const status = statusConfig[topUp.status] || statusConfig.PENDING;
  const MethodIcon = method.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-muted"
          )}
        >
          <MethodIcon className={cn("h-5 w-5", method.color)} />
        </div>
        <div>
          <p className="font-medium">{method.label}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(topUp.createdAt)} • {formatTime(topUp.createdAt)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold text-emerald-600">
          + {formatCurrency(topUp.amount)}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
          {topUp.referenceCode && (
            <span className="text-xs text-muted-foreground">
              {topUp.referenceCode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


