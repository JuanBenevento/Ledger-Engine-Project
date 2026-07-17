import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * TableSkeleton atom.
 *
 * Renders a skeleton that approximates table layouts:
 * - Header: title skeleton
 * - Content: row skeletons with column placeholders
 *
 * Default: 5 rows × 3 columns.
 * Uses data-slot="skeleton" for test selection.
 */
export function TableSkeleton({
  rows = 5,
  columns = 3,
  className,
}: TableSkeletonProps) {
  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(columns - 2, 3) }).map(
                  (_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      className="h-4 w-16"
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
