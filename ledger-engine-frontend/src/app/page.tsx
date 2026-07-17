import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  QrCode,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Billeteras Múltiples",
    description:
      "Organiza tu dinero por propósito. Crea hasta 5 billeteras con saldos independientes.",
  },
  {
    icon: ArrowUpRight,
    title: "Recargas Fáciles",
    description:
      "Recarga con tarjeta, PSE o en efectivo. Múltiples opciones para tu comodidad.",
  },
  {
    icon: QrCode,
    title: "Pagos por QR",
    description:
      "Genera códigos QR para recibir pagos o escanea para transferir al instante.",
  },
  {
    icon: Shield,
    title: "Seguridad Total",
    description:
      "Autenticación con Keycloak, 2FA opcional y verificación de identidad.",
  },
  {
    icon: Smartphone,
    title: "Diseño Mobile-First",
    description:
      "Experiencia optimizada para celular. Accede a tu billetera desde cualquier lugar.",
  },
  {
    icon: Globe,
    title: "Hecho para LATAM",
    description:
      "Formato COP, PSE, Baloto/Efecty. Diseñado para las necesidades de Colombia.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center space-y-8 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Tu billetera virtual
          <br />
          <span className="text-primary">segura y rápida</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Envía y recibe dinero, paga servicios y gestiona tus finanzas desde
          una sola plataforma. Diseñada para Colombia y Latinoamérica.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
            Crear cuenta gratis
          </Link>
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted">
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/40 px-4 py-24">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Todo lo que necesitas
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h2 className="mb-4 text-3xl font-bold">
          ¿Listo para empezar?
        </h2>
        <p className="mb-8 max-w-xl text-muted-foreground">
          Únete a miles de personas que ya usan Ledger Engine para manejar su
          dinero de forma inteligente.
        </p>
        <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          Comenzar ahora
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Ledger Engine. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Soporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
