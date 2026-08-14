"use client";

import { useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionListSkeleton } from "@/components/atoms/skeletons/transaction-list-skeleton";
import { formatCurrency } from "@/hooks/use-currency";
import { Transaction, TransactionType, TransactionStatus } from "@/types/wallet";
import { cn } from "@/lib/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRightLeftIcon,
  CreditCardIcon,
  ReceiptIcon,
  Loader2Icon,
} from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * Transaction type configuration.
 */
const typeConfig: Record<
  TransactionType,
  { label: string; icon: React.ElementType; color: string }
> = {
  DEPOSIT: {
    label: "Depósito",
    icon: ArrowDownIcon,
    color: "text-emerald-500",
  },
  WITHDRAWAL: {
    label: "Retiro",
    icon: ArrowUpIcon,
    color: "text-rose-500",
  },
  TRANSFER: {
    label: "Transferencia",
    icon: ArrowRightLeftIcon,
    color: "text-blue-500",
  },
  TOPUP: {
    label: "Recarga",
    icon: CreditCardIcon,
    color: "text-violet-500",
  },
  PAYMENT: {
    label: "Pago",
    icon: ReceiptIcon,
    color: "text-amber-500",
  },
};

/**
 * Transaction status configuration.
 */
const statusConfig: Record<
  TransactionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  COMPLETED: { label: "Completado", variant: "default" },
  PENDING: { label: "Pendiente", variant: "secondary" },
  FAILED: { label: "Fallido", variant: "destructive" },
};

/**
 * Group transactions by date.
 */
function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Ayer";
    } else {
      key = date.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  });

  return groups;
}

/**
 * Format transaction time.
 */
function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * TransactionHistory organism.
 *
 * Paginated transaction table with:
 * - Date grouping (Hoy, Ayer, fecha completa)
 * - Type icons (DEPOSIT, WITHDRAWAL, TRANSFER, TOPUP, PAYMENT)
 * - Status badges
 * - Infinite scroll (20 per page)
 * - COP formatted amounts
 */
export function TransactionHistory({
  transactions,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: TransactionHistoryProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, onLoadMore]);

  const groupedTransactions = useMemo(
    () => groupByDate(transactions),
    [transactions]
  );

  if (isLoading && transactions.length === 0) {
    return <TransactionListSkeleton className={className} />;
  }

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ReceiptIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No hay transacciones recientes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historial de transacciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from(groupedTransactions.entries()).map(([date, txs]) => (
            <div key={date}>
              {/* Date Header */}
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {date}
              </h3>

              {/* Transactions for this date */}
              <div className="space-y-2">
                {txs.map((tx) => (
                  <TransactionRow key={tx.transactionId} transaction={tx} />
                ))}
              </div>
            </div>
          ))}

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Single transaction row component.
 */
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const type = typeConfig[transaction.type] || typeConfig.TRANSFER;
  const status = statusConfig[transaction.status] || statusConfig.PENDING;
  const TypeIcon = type.icon;

  const isPositive = transaction.type === "DEPOSIT" || transaction.type === "TOPUP";
  const amountColor = isPositive ? "text-emerald-600" : "text-rose-600";
  const amountPrefix = isPositive ? "+" : "-";

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isPositive ? "bg-emerald-100" : "bg-rose-100"
          )}
        >
          <TypeIcon className={cn("h-5 w-5", type.color)} />
        </div>
        <div>
          <p className="font-medium">{type.label}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.description || transaction.counterparty?.name || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={cn("font-semibold", amountColor)}>
          {amountPrefix} {formatCurrency(transaction.amount)}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTime(transaction.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}


