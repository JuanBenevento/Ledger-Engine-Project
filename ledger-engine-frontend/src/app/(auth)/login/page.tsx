import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/features/auth/login-form";

/**
 * Login page with Keycloak integration.
 *
 * Full implementation with:
 * - Email/password form with Zod validation
 * - "Remember me" checkbox
 * - "Forgot password?" link
 * - "Register" link
 * - Loading state during Keycloak redirect
 * - Error handling with toast notifications
 * - Redirect to dashboard on success
 */
export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu billetera
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
