"use client";

import { cn } from "@/lib/utils";
import {
  calculatePasswordStrength,
  type PasswordStrengthLevel,
} from "@/lib/validators/auth";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const STRENGTH_COLORS: Record<PasswordStrengthLevel, string> = {
  0: "bg-red-500",
  1: "bg-orange-500",
  2: "bg-yellow-500",
  3: "bg-lime-500",
  4: "bg-green-500",
};

/**
 * Password strength indicator component.
 *
 * Shows a visual bar with color-coded strength levels
 * and descriptive text in Spanish.
 */
export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const strength = calculatePasswordStrength(password);
  const bars = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-1">
        {bars.map((index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index < strength.score
                ? STRENGTH_COLORS[strength.score]
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs font-medium",
          strength.score <= 1 && "text-red-500",
          strength.score === 2 && "text-yellow-600",
          strength.score >= 3 && "text-green-600"
        )}
      >
        {strength.label}
      </p>
    </div>
  );
}
