import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionListSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * TransactionListSkeleton atom.
 *
 * Renders a skeleton that approximates the TransactionHistory layout:
 * - Header: title skeleton
 * - Content: date group headers + transaction rows (icon, text, amount, badge)
 *
 * Default: 3 date groups with 2 rows each.
 * Uses data-slot="skeleton" for test selection.
 */
export function TransactionListSkeleton({
  rows = 3,
  className,
}: TransactionListSkeletonProps) {
  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from({ length: rows }).map((_, groupIndex) => (
            <div key={groupIndex}>
              {/* Date group header skeleton */}
              <Skeleton className="h-4 w-24 mb-3" />

              {/* Transaction row skeletons */}
              <div className="space-y-2">
                {[1, 2].map((rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
