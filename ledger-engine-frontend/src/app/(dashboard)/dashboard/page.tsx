import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard page placeholder.
 *
 * Full implementation in Phase 2 (Core Wallet).
 * Will include wallet grid, balance hero, recent activity, etc.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vista general</CardTitle>
          <CardDescription>
            Panel de control de tu billetera virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dashboard completo — Implementación en Fase 2 (Billeteras)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
