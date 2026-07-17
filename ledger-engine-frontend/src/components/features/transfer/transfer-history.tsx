"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionListSkeleton } from "@/components/atoms/skeletons/transaction-list-skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2Icon,
  ArrowRightLeftIcon,
} from "lucide-react";

interface Transfer {
  transferId: string;
  amount: number;
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  description?: string;
  createdAt: string;
  counterparty?: { name?: string; email?: string };
  direction: "SENT" | "RECEIVED";
}

interface TransferHistoryProps {
  transfers: Transfer[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * Transfer status configuration.
 */
const statusConfig: Record<
  Transfer["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  COMPLETED: { label: "Completado", variant: "default" },
  PENDING: { label: "Pendiente", variant: "secondary" },
  FAILED: { label: "Fallido", variant: "destructive" },
};

/**
 * TransferHistory organism.
 *
 * Paginated transfer table with:
 * - Two tabs: Enviados / Recibidos
 * - Status badges (COMPLETED=default, PENDING=secondary, FAILED=destructive)
 * - Date formatting (es-CO locale)
 * - COP formatted amounts
 * - Recipient/sender name display
 * - Load more button
 */
export function TransferHistory({
  transfers,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: TransferHistoryProps) {
  const [activeTab, setActiveTab] = useState<"SENT" | "RECEIVED">("SENT");

  const sentTransfers = useMemo(
    () => transfers.filter((t) => t.direction === "SENT"),
    [transfers]
  );

  const receivedTransfers = useMemo(
    () => transfers.filter((t) => t.direction === "RECEIVED"),
    [transfers]
  );

  if (isLoading && transfers.length === 0) {
    return <TransactionListSkeleton className={className} />;
  }

  if (transfers.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ArrowRightLeftIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay transferencias</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historial de transferencias</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="SENT" onValueChange={(value) => setActiveTab(value as "SENT" | "RECEIVED")}>
          <TabsList>
            <TabsTrigger value="SENT">Enviados</TabsTrigger>
            <TabsTrigger value="RECEIVED">Recibidos</TabsTrigger>
          </TabsList>

          <TabsContent value="SENT">
            <TransferList
              transfers={sentTransfers}
              hasMore={hasMore && activeTab === "SENT"}
              onLoadMore={onLoadMore}
            />
          </TabsContent>

          <TabsContent value="RECEIVED">
            <TransferList
              transfers={receivedTransfers}
              hasMore={hasMore && activeTab === "RECEIVED"}
              onLoadMore={onLoadMore}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Transfer list with load more support.
 */
function TransferList({
  transfers,
  hasMore,
  onLoadMore,
}: {
  transfers: Transfer[];
  hasMore: boolean;
  onLoadMore?: () => void;
}) {
  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">No hay transferencias en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transfers.map((transfer) => (
        <TransferRow key={transfer.transferId} transfer={transfer} />
      ))}

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
  );
}

/**
 * Single transfer row component.
 */
function TransferRow({ transfer }: { transfer: Transfer }) {
  const status = statusConfig[transfer.status] || statusConfig.PENDING;
  const isSent = transfer.direction === "SENT";
  const amountColor = isSent ? "text-rose-600" : "text-emerald-600";
  const amountPrefix = isSent ? "-" : "+";

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isSent ? "bg-rose-100" : "bg-emerald-100"
          )}
        >
          {isSent ? (
            <ArrowUpRight className="h-5 w-5 text-rose-500" />
          ) : (
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {transfer.description || transfer.counterparty?.name || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={cn("font-semibold", amountColor)}>
          {amountPrefix} {formatCurrency(transfer.amount)}
        </p>
        <Badge variant={status.variant} className="text-xs">
          {status.label}
        </Badge>
      </div>
    </div>
  );
}


