import { Header } from "@/components/layout";
import { Sidebar } from "@/components/layout";
import { NotificationToastProvider } from "@/components/atoms/notification-toast-provider";
import { ErrorBoundary } from "@/components/atoms/error-boundary";

/**
 * Dashboard layout with sidebar + header shell.
 *
 * Used for all authenticated dashboard pages.
 * Responsive: sidebar on desktop, hamburger on mobile.
 * Includes error boundary to catch render errors gracefully.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationToastProvider>
      <ErrorBoundary>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </ErrorBoundary>
    </NotificationToastProvider>
  );
}
