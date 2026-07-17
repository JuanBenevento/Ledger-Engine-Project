import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletCardSkeletonProps {
  className?: string;
}

/**
 * WalletCardSkeleton atom.
 *
 * Renders a skeleton that approximates the WalletCard layout:
 * - Header: wallet icon placeholder + name skeleton + badge skeleton
 * - Content: large balance skeleton + currency label skeleton
 *
 * Uses data-slot="skeleton" for test selection.
 */
export function WalletCardSkeleton({ className }: WalletCardSkeletonProps) {
  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-5 w-16" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
