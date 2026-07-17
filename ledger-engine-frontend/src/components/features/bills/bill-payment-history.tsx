"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/atoms/skeletons/table-skeleton";
import { formatCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import {
  ReceiptIcon,
  ZapIcon,
  DropletIcon,
  WifiIcon,
  SmartphoneIcon,
  BuildingIcon,
  Loader2Icon,
} from "lucide-react";

interface BillPayment {
  paymentId: string;
  billerName: string;
  billerCategory: string;
  amount: number;
  currency: string;
  reference: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

interface BillPaymentHistoryProps {
  payments: BillPayment[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

const statusConfig: Record<
  BillPayment["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  COMPLETED: { label: "Completado", variant: "default" },
  PROCESSING: { label: "Procesando", variant: "secondary" },
  FAILED: { label: "Fallido", variant: "destructive" },
};

const categoryConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  SERVICIOS: { icon: ZapIcon, color: "text-yellow-500" },
  ENERGIA: { icon: ZapIcon, color: "text-yellow-500" },
  AGUA: { icon: DropletIcon, color: "text-blue-500" },
  INTERNET: { icon: WifiIcon, color: "text-violet-500" },
  TELEFONIA: { icon: SmartphoneIcon, color: "text-emerald-500" },
  GAS: { icon: ZapIcon, color: "text-orange-500" },
  default: { icon: BuildingIcon, color: "text-muted-foreground" },
};

function getCategoryConfig(category: string) {
  const key = category.toUpperCase();
  return categoryConfig[key] || categoryConfig.default;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BillPaymentHistory({
  payments,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: BillPaymentHistoryProps) {
  if (isLoading && payments.length === 0) {
    return <TableSkeleton rows={3} className={className} />;
  }

  if (payments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ReceiptIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay pagos de servicios</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historial de pagos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {payments.map((payment) => (
            <BillPaymentRow key={payment.paymentId} payment={payment} />
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
      </CardContent>
    </Card>
  );
}

function BillPaymentRow({ payment }: { payment: BillPayment }) {
  const config = getCategoryConfig(payment.billerCategory);
  const status = statusConfig[payment.status] || statusConfig.PROCESSING;
  const CategoryIcon = config.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-muted"
          )}
        >
          <CategoryIcon className={cn("h-5 w-5", config.color)} />
        </div>
        <div>
          <p className="font-medium">{payment.billerName}</p>
          <p className="text-sm text-muted-foreground">
            {payment.billerCategory}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(payment.createdAt)} • {formatTime(payment.createdAt)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold">- {formatCurrency(payment.amount)}</p>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
          {payment.reference && (
            <span className="text-xs text-muted-foreground">
              {payment.reference}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


