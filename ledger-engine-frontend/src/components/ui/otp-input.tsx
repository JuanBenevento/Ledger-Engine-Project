"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 6-digit OTP input component with auto-focus management.
 *
 * Features:
 * - Auto-focus next input on digit entry
 * - Backspace moves to previous input
 * - Paste support for multi-digit codes
 * - Auto-submit when all digits entered
 */
export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
        setFocusedIndex(index);
      }
    },
    [length]
  );

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (disabled) return;

      // Only allow digits
      const sanitized = digit.replace(/[^0-9]/g, "").slice(0, 1);
      const newValue =
        value.slice(0, index) + sanitized + value.slice(index + 1);

      onChange(newValue);

      // Auto-focus next input if digit was entered
      if (sanitized && index < length - 1) {
        focusInput(index + 1);
      }
    },
    [value, onChange, disabled, length, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (!value[index] && index > 0) {
          // If current input is empty, move to previous
          const newValue =
            value.slice(0, index - 1) + value.slice(index);
          onChange(newValue);
          focusInput(index - 1);
        } else {
          // Clear current input
          const newValue = value.slice(0, index) + value.slice(index + 1);
          onChange(newValue);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    },
    [value, onChange, disabled, length, focusInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

      if (pastedData.length > 0) {
        const newValue = pastedData.slice(0, length);
        onChange(newValue);

        // Focus the last filled input or the next empty one
        const nextEmptyIndex = newValue.length;
        focusInput(Math.min(nextEmptyIndex, length - 1));
      }
    },
    [disabled, length, onChange, focusInput]
  );

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={cn(
            "h-12 w-12 rounded-lg border bg-background text-center text-lg font-medium",
            "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            focusedIndex === index && "border-primary ring-2 ring-primary/20",
            value[index] && "border-primary"
          )}
          aria-label={`Dígito ${index + 1} de ${length}`}
        />
      ))}
    </div>
  );
}
