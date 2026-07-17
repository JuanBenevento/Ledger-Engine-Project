"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { OTPInput } from "@/components/ui/otp-input";

function VerifyPhoneContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (otpValue: string) => {
      if (otpValue.length !== 6) return;

      setStatus("loading");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/verify-phone`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone, otp: otpValue }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.message || "Código de verificación incorrecto"
          );
        }

        setStatus("success");
        toast.success("Teléfono verificado", {
          description: "Tu número de teléfono ha sido verificado exitosamente",
        });
      } catch (error) {
        setStatus("error");
        toast.error("Error de verificación", {
          description:
            error instanceof Error
              ? error.message
              : "Código de verificación incorrecto",
        });
        setOtp("");
      }
    },
    [phone]
  );

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (otp.length === 6 && status !== "loading") {
      handleVerify(otp);
    }
  }, [otp, status, handleVerify]);

  const handleResend = async () => {
    setIsResending(true);

    try {
      // Simulate API call for resend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCooldown(60);
      toast.success("Código enviado", {
        description: "Se ha enviado un nuevo código de verificación a tu teléfono",
      });
    } catch {
      toast.error("Error al enviar código", {
        description: "No se pudo enviar el código. Intenta de nuevo.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Verificar número de teléfono
        </CardTitle>
        <CardDescription>
          Ingresa el código de 6 dígitos que enviamos a{" "}
          <span className="font-medium">{phone || "tu teléfono"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {status === "success" ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Teléfono verificado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tu número de teléfono ha sido verificado exitosamente.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                Ir al panel principal
              </Link>
            </div>
          ) : (
            <>
              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={status === "loading"}
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>
                      Código incorrecto. Intenta de nuevo.
                    </span>
                  </div>
                )}
              </div>

              {/* Resend Button */}
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No recibiste el código?
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : cooldown > 0 ? (
                    `Reenviar código en ${cooldown}s`
                  ) : (
                    "Reenviar código"
                  )}
                </Button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
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
 * Phone verification page with OTP input.
 *
 * Features:
 * - 6-digit OTP input with auto-submit
 * - Resend code button with cooldown (60s)
 * - Success/error states
 * - Calls POST /api/v1/auth/verify-phone
 */
export default function VerifyPhonePage() {
  return (
    <Suspense>
      <VerifyPhoneContent />
    </Suspense>
  );
}
