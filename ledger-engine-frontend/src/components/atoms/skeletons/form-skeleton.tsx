import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

/**
 * FormSkeleton atom.
 *
 * Renders a skeleton that approximates form layouts:
 * - Multiple field groups: label skeleton + input skeleton
 * - Submit button skeleton at the bottom
 *
 * Default: 3 fields. Each field has a label + input skeleton.
 * Uses data-slot="skeleton" for test selection.
 */
export function FormSkeleton({ fields = 3, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
