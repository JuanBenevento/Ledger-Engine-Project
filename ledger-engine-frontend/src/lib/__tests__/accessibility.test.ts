import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateId,
  getAriaDescribedBy,
  getAriaLabelledBy,
  getFocusStyles,
  announceToScreenReader,
} from "../accessibility";

describe("accessibility utilities", () => {
  describe("generateId", () => {
    it("generates a unique id with default prefix", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toMatch(/^a11y-/);
      expect(id2).toMatch(/^a11y-/);
      expect(id1).not.toBe(id2);
    });

    it("generates id with custom prefix", () => {
      const id = generateId("email-input");

      expect(id).toMatch(/^email-input-/);
    });

    it("generates ids that are valid CSS selectors (no spaces, special chars)", () => {
      const id = generateId("test");
      // Valid id should not throw when used in querySelector
      expect(() => document.querySelector(`#${CSS.escape(id)}`)).not.toThrow();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("generates sequential ids even with different prefixes", () => {
      const id1 = generateId("a");
      const id2 = generateId("b");

      // Both should be unique regardless of prefix
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^a-/);
      expect(id2).toMatch(/^b-/);
    });

    it("appends a numeric suffix that increments", () => {
      const id1 = generateId("field");
      const id2 = generateId("field");

      // Extract the numeric part
      const num1 = parseInt(id1.split("-").pop()!, 10);
      const num2 = parseInt(id2.split("-").pop()!, 10);

      expect(num2).toBe(num1 + 1);
    });
  });

  describe("getAriaDescribedBy", () => {
    it("returns aria-describedby attribute object", () => {
      const result = getAriaDescribedBy("error-msg-1");

      expect(result).toEqual({ "aria-describedby": "error-msg-1" });
    });

    it("preserves the exact id passed", () => {
      const result = getAriaDescribedBy("my-custom-id-123");

      expect(result["aria-describedby"]).toBe("my-custom-id-123");
    });
  });

  describe("getAriaLabelledBy", () => {
    it("returns aria-labelledby attribute object", () => {
      const result = getAriaLabelledBy("label-1");

      expect(result).toEqual({ "aria-labelledby": "label-1" });
    });

    it("preserves the exact id passed", () => {
      const result = getAriaLabelledBy("field-label-42");

      expect(result["aria-labelledby"]).toBe("field-label-42");
    });
  });

  describe("getFocusStyles", () => {
    it("returns a non-empty string of CSS classes", () => {
      const styles = getFocusStyles();

      expect(typeof styles).toBe("string");
      expect(styles.length).toBeGreaterThan(0);
    });

    it("includes ring/focus styles for keyboard visibility", () => {
      const styles = getFocusStyles();

      // Should include focus ring styles for WCAG compliance
      expect(styles).toContain("ring");
    });

    it("includes focus-visible to avoid mouse click ring", () => {
      const styles = getFocusStyles();

      expect(styles).toContain("focus-visible");
    });

    it("includes ring-offset for proper spacing around the ring", () => {
      const styles = getFocusStyles();

      expect(styles).toContain("ring-offset");
    });
  });

  describe("announceToScreenReader", () => {
    afterEach(() => {
      // Clean up any live region created by announceToScreenReader
      const regions = document.querySelectorAll("[aria-live]");
      regions.forEach((r) => r.parentNode?.removeChild(r));
    });

    it("creates an aria-live region in the DOM", () => {
      announceToScreenReader("Notification message");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toBeInTheDocument();
    });

    it("sets polite priority by default", () => {
      announceToScreenReader("Default message");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });

    it("sets assertive priority when specified", () => {
      announceToScreenReader("Urgent message", "assertive");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toHaveAttribute("aria-live", "assertive");
    });

    it("puts the message text inside the live region", () => {
      announceToScreenReader("Hello screen reader");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toHaveTextContent("Hello screen reader");
    });

    it("adds the element with role=status for semantic meaning", () => {
      announceToScreenReader("Status update");

      const liveRegion = document.querySelector("[role='status']");
      expect(liveRegion).toBeInTheDocument();
    });

    it("sets aria-atomic=true so the full message is read", () => {
      announceToScreenReader("Hidden message");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    });

    it("cleans up the live region after the timeout", () => {
      vi.useFakeTimers();

      announceToScreenReader("Temporary message");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toBeInTheDocument();

      // Fast-forward past the cleanup delay
      vi.advanceTimersByTime(1100);

      const cleanedRegion = document.querySelector("[aria-live]");
      expect(cleanedRegion).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    it("does not throw in server-side rendering environment", () => {
      // Simulate SSR by temporarily removing document
      const originalDocument = globalThis.document;
      // @ts-expect-error - Intentionally setting to undefined for SSR simulation
      globalThis.document = undefined;

      expect(() => announceToScreenReader("SSR message")).not.toThrow();

      globalThis.document = originalDocument;
    });
  });
});
