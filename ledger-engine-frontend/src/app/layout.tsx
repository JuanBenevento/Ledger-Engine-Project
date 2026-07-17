import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/atoms/skip-link";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ledger Engine",
  },
};

export const metadata: Metadata = {
  title: {
    default: "Ledger Engine",
    template: "%s | Ledger Engine",
  },
  description:
    "Tu billetera virtual segura. Envía y recibe dinero, paga servicios, gestiona tus finanzas.",
  keywords: [
    "billetera virtual",
    "fintech",
    "pagos",
    "transferencias",
    "Colombia",
  ],
  // PWA manifest link
  manifest: "/manifest.json",
  // Format detection — prevent phone number auto-linking
  formatDetection: {
    telephone: false,
  },
  // Open Graph
  openGraph: {
    title: "Ledger Engine - Billetera Virtual",
    description:
      "Tu billetera virtual segura para pagos, transferencias y más",
    siteName: "Ledger Engine",
    locale: "es_CO",
    type: "website",
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Ledger Engine - Billetera Virtual",
    description:
      "Tu billetera virtual segura para pagos, transferencias y más",
  },
  // Apple specifics
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ledger Engine",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", inter.variable)}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="antialiased">
        <SkipLink />
        <AuthProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
