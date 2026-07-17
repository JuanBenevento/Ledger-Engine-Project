"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(
        "No se encontró el token de verificación. El enlace podría estar incompleto."
      );
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.message || "Error al verificar el correo electrónico"
          );
        }

        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Error al verificar el correo electrónico"
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Verificación de correo electrónico
        </CardTitle>
        <CardDescription>
          {status === "loading" &&
            "Verificando tu correo electrónico..."}
          {status === "success" &&
            "Tu correo electrónico ha sido verificado exitosamente"}
          {status === "error" &&
            "Hubo un error al verificar tu correo electrónico"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-center">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tu cuenta ha sido activada. Ya puedes iniciar sesión y
                comenzar a usar tu billetera virtual.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                Iniciar sesión
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">
                {errorMessage}
              </p>
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Volver al inicio de sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center text-sm font-medium text-primary hover:underline"
                >
                  Solicitar nuevo enlace de verificación
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Email verification page.
 *
 * Features:
 * - Extracts token from URL search params
 * - Auto-verifies on load
 * - Shows success/error status
 * - Link to login after verification
 */
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
