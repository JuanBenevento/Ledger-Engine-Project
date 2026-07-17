import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/features/auth/register-form";

/**
 * Register page for new user registration.
 *
 * Full implementation with:
 * - Multi-field form with email, phone (E.164), name, password
 * - Password strength indicator
 * - Terms & conditions checkbox
 * - Calls POST /api/v1/auth/register
 * - Success message: "Check your email to verify"
 * - Link to login page
 */
export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Regístrate para comenzar a usar tu billetera virtual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
