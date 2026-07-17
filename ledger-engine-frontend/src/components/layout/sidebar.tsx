"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  QrCode,
  Receipt,
  Bell,
  Shield,
  FileCheck,
  LayoutDashboard,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Billeteras", href: "/wallets", icon: Wallet },
  { name: "Recargar", href: "/topup", icon: ArrowUpRight },
  { name: "Transferir", href: "/transfer", icon: ArrowUpRight },
  { name: "Código QR", href: "/qr", icon: QrCode },
  { name: "Pagar servicios", href: "/bills", icon: Receipt },
  { name: "Notificaciones", href: "/notifications", icon: Bell },
  { name: "Seguridad", href: "/security", icon: Shield },
  { name: "Verificación", href: "/kyc", icon: FileCheck },
];

/**
 * Sidebar navigation component.
 *
 * Features:
 * - Active state highlighting
 * - Icon + label navigation items
 * - Collapsible on mobile (controlled by parent)
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/40 lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
