import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

/**
 * Forgot password page.
 *
 * Features:
 * - Single email input
 * - Always shows success message (anti-enumeration)
 * - Calls POST /api/v1/auth/forgot-password
 * - Success message: "Check your email for reset link"
 */
export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Restablecer contraseña
        </CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para recibir un enlace de
          recuperación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
