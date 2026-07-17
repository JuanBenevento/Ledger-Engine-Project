"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/lib/api/hooks/use-auth-api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validators/auth";

/**
 * Forgot password form component.
 *
 * Features:
 * - Single email input
 * - Always shows success message (anti-enumeration)
 * - Calls POST /api/v1/auth/forgot-password
 * - Success message: "Check your email for reset link"
 */
export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setIsSuccess(true);
    } catch {
      // Always show success to prevent email enumeration
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            Correo electrónico enviado
          </h3>
          <p className="text-sm text-muted-foreground">
            Si el correo electrónico está registrado, recibirás un enlace
            para restablecer tu contraseña. Revisa tu bandeja de entrada y
            la carpeta de spam.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          disabled={forgotPasswordMutation.isPending}
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Ingresa el correo electrónico asociado a tu cuenta. Si el correo
          existe, recibirás un enlace para restablecer tu contraseña.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando enlace...
          </>
        ) : (
          "Enviar enlace de recuperación"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        ¿Recordaste tu contraseña?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Iniciar sesión
        </Link>
      </div>
    </form>
  );
}
