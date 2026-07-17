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
  QrCodeIcon,
} from "lucide-react";

interface QrPayment {
  paymentId: string;
  amount: number;
  currency: string;
  recipientName?: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  type: "SENT" | "RECEIVED";
  createdAt: string;
  description?: string;
}

interface QRPaymentHistoryProps {
  payments: QrPayment[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * QR payment status configuration.
 */
const statusConfig: Record<
  QrPayment["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  COMPLETED: { label: "Completado", variant: "default" },
  PENDING: { label: "Pendiente", variant: "secondary" },
  FAILED: { label: "Fallido", variant: "destructive" },
};

/**
 * QRPaymentHistory organism.
 *
 * Paginated QR payment table with:
 * - Two tabs: Enviados / Recibidos
 * - Status badges (COMPLETED=default, PENDING=secondary, FAILED=destructive)
 * - Date formatting (es-CO locale)
 * - COP formatted amounts
 * - Load more button
 */
export function QRPaymentHistory({
  payments,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: QRPaymentHistoryProps) {
  const [activeTab, setActiveTab] = useState<"SENT" | "RECEIVED">("SENT");

  const sentPayments = useMemo(
    () => payments.filter((p) => p.type === "SENT"),
    [payments]
  );

  const receivedPayments = useMemo(
    () => payments.filter((p) => p.type === "RECEIVED"),
    [payments]
  );

  if (isLoading && payments.length === 0) {
    return <TransactionListSkeleton className={className} />;
  }

  if (payments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <QrCodeIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay pagos QR</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historial de pagos QR</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="SENT" onValueChange={(value) => setActiveTab(value as "SENT" | "RECEIVED")}>
          <TabsList>
            <TabsTrigger value="SENT">Enviados</TabsTrigger>
            <TabsTrigger value="RECEIVED">Recibidos</TabsTrigger>
          </TabsList>

          <TabsContent value="SENT">
            <QRPaymentList
              payments={sentPayments}
              hasMore={hasMore && activeTab === "SENT"}
              onLoadMore={onLoadMore}
            />
          </TabsContent>

          <TabsContent value="RECEIVED">
            <QRPaymentList
              payments={receivedPayments}
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
 * QR payment list with load more support.
 */
function QRPaymentList({
  payments,
  hasMore,
  onLoadMore,
}: {
  payments: QrPayment[];
  hasMore: boolean;
  onLoadMore?: () => void;
}) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">No hay pagos en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payments.map((payment) => (
        <QRPaymentRow key={payment.paymentId} payment={payment} />
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
 * Single QR payment row component.
 */
function QRPaymentRow({ payment }: { payment: QrPayment }) {
  const status = statusConfig[payment.status] || statusConfig.PENDING;
  const isSent = payment.type === "SENT";
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
            {payment.description || payment.recipientName || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={cn("font-semibold", amountColor)}>
          {amountPrefix} {formatCurrency(payment.amount)}
        </p>
        <Badge variant={status.variant} className="text-xs">
          {status.label}
        </Badge>
      </div>
    </div>
  );
}


