/**
 * Accessibility utilities for the Ledger Engine Virtual Wallet.
 *
 * Provides helper functions for ARIA attributes, focus management,
 * and screen reader announcements.
 */

let counter = 0;

/**
 * Generates a unique ID with an optional prefix.
 * Useful for linking form labels, error messages, and ARIA attributes.
 *
 * @param prefix - Optional prefix for the ID (default: "a11y")
 * @returns A unique string ID
 */
export function generateId(prefix?: string): string {
  counter += 1;
  return `${prefix ?? "a11y"}-${counter}`;
}

/**
 * Returns an object with the aria-describedby attribute.
 * Use to associate an element with its description (e.g., error messages).
 *
 * @param id - The ID of the element that describes this one
 * @returns Object with aria-describedby key
 */
export function getAriaDescribedBy(
  id: string
): { "aria-describedby": string } {
  return { "aria-describedby": id };
}

/**
 * Returns an object with the aria-labelledby attribute.
 * Use to associate an element with its visible label.
 *
 * @param id - The ID of the element that labels this one
 * @returns Object with aria-labelledby key
 */
export function getAriaLabelledBy(
  id: string
): { "aria-labelledby": string } {
  return { "aria-labelledby": id };
}

/**
 * Returns Tailwind CSS classes for visible focus ring styles.
 * Ensures keyboard users can see which element has focus (WCAG 2.4.7).
 *
 * @returns CSS class string with focus ring styles
 */
export function getFocusStyles(): string {
  return "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
}

/**
 * Announces a message to screen readers via an ARIA live region.
 * Creates a temporary live region, sets its text, and removes it after a delay.
 *
 * @param message - The message to announce
 * @param priority - "polite" (default) or "assertive" for urgent messages
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof document === "undefined") return;

  const region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", priority);
  region.setAttribute("aria-atomic", "true");
  region.className = "sr-only";
  region.textContent = message;

  document.body.appendChild(region);

  // Clean up after a reasonable delay so screen readers have time to read
  setTimeout(() => {
    if (region.parentNode) {
      region.parentNode.removeChild(region);
    }
  }, 1000);
}
