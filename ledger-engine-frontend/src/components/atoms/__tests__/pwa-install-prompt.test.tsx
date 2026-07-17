import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

/**
 * Mock BeforeInstallPromptEvent that mimics the real browser event.
 * The real event has prompt() and userChoice properties.
 */
class MockBeforeInstallPromptEvent extends Event {
  promptFn: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  outcome: "accepted" | "dismissed";

  constructor(
    outcome: "accepted" | "dismissed" = "accepted",
    opts?: EventInit
  ) {
    super("beforeinstallprompt", { bubbles: true, cancelable: true, ...opts });
    this.outcome = outcome;
    this.promptFn = vi.fn().mockResolvedValue(undefined);
    this.userChoice = Promise.resolve({ outcome: this.outcome });
  }

  prompt() {
    return this.promptFn();
  }
}

describe("PwaInstallPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render the install prompt when beforeinstallprompt is not fired", async () => {
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    expect(
      screen.queryByRole("button", { name: /instalar/i })
    ).not.toBeInTheDocument();
  });

  it("shows install button when beforeinstallprompt fires", async () => {
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    const event = new MockBeforeInstallPromptEvent("accepted");
    act(() => {
      window.dispatchEvent(event);
    });

    expect(
      screen.getByRole("button", { name: /instalar app/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Instalar Ledger Engine")).toBeInTheDocument();
    expect(
      screen.getByText("Accede rápido desde tu pantalla de inicio")
    ).toBeInTheDocument();
  });

  it("calls prompt() when install button is clicked", async () => {
    const user = userEvent.setup();
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    const event = new MockBeforeInstallPromptEvent("accepted");
    act(() => {
      window.dispatchEvent(event);
    });

    const installButton = screen.getByRole("button", {
      name: /instalar app/i,
    });
    await user.click(installButton);

    expect(event.promptFn).toHaveBeenCalled();
  });

  it("hides the install button after successful installation", async () => {
    const user = userEvent.setup();
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    const event = new MockBeforeInstallPromptEvent("accepted");
    act(() => {
      window.dispatchEvent(event);
    });

    const installButton = screen.getByRole("button", {
      name: /instalar app/i,
    });
    await user.click(installButton);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /instalar app/i })
      ).not.toBeInTheDocument();
    });
  });

  it("hides the install button when user dismisses the prompt", async () => {
    const user = userEvent.setup();
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    const event = new MockBeforeInstallPromptEvent("dismissed");
    act(() => {
      window.dispatchEvent(event);
    });

    const installButton = screen.getByRole("button", {
      name: /instalar app/i,
    });
    await user.click(installButton);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /instalar app/i })
      ).not.toBeInTheDocument();
    });
  });

  it("does not show install button on platforms without beforeinstallprompt", async () => {
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    // No event dispatched — simulate iOS Safari behavior
    expect(
      screen.queryByRole("button", { name: /instalar/i })
    ).not.toBeInTheDocument();
  });

  it("can be dismissed and stays hidden for the session", async () => {
    const user = userEvent.setup();
    const { PwaInstallPrompt } = await import(
      "@/components/atoms/pwa-install-prompt"
    );

    render(<PwaInstallPrompt />);

    // First event — shows the prompt
    const event1 = new MockBeforeInstallPromptEvent("accepted");
    act(() => {
      window.dispatchEvent(event1);
    });

    expect(
      screen.getByRole("button", { name: /instalar app/i })
    ).toBeInTheDocument();

    // Click dismiss
    const dismissButton = screen.getByRole("button", {
      name: /cerrar/i,
    });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /instalar app/i })
      ).not.toBeInTheDocument();
    });

    // Second event — should NOT show because user dismissed
    const event2 = new MockBeforeInstallPromptEvent("accepted");
    act(() => {
      window.dispatchEvent(event2);
    });

    expect(
      screen.queryByRole("button", { name: /instalar app/i })
    ).not.toBeInTheDocument();
  });
});
