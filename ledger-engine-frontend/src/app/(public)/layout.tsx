import { Header } from "@/components/layout";

/**
 * Public layout with centered card.
 *
 * Used for marketing pages, landing page, etc.
 * Clean, focused layout without sidebar.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
