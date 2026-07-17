"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA Install Prompt component.
 *
 * Listens for the browser's `beforeinstallprompt` event and shows
 * an install button when the app is installable as a PWA.
 * Supports Spanish UI text. Dismissed state persists for the session.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleBeforeInstallPrompt = useCallback(
    (e: Event) => {
      if (dismissed) return;
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    },
    [dismissed]
  );

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [handleBeforeInstallPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted" || outcome === "dismissed") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label="Instalar aplicación"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg"
    >
      <Download className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Instalar Ledger Engine</p>
        <p className="text-xs text-muted-foreground">
          Accede rápido desde tu pantalla de inicio
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleInstall} aria-label="Instalar App">
          Instalar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
