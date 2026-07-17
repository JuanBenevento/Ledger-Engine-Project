import { Header } from "@/components/layout";

/**
 * Auth layout with centered card.
 *
 * Used for login, register, forgot password, etc.
 * No sidebar — clean, focused authentication experience.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-muted/40">
      <Header />
      <main id="main-content" className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
