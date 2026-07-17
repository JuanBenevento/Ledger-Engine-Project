"use client";

import { useMutation } from "@tanstack/react-query";
import api from "../client";
import type {
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Hook for user registration.
 *
 * Calls POST /api/v1/auth/register
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<RegisterResponse> => {
      const { data: response, error } = await api.POST(
        "/api/v1/auth/register",
        {
          body: {
            email: data.email,
            phoneNumber: data.phone,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
          },
        }
      );

      if (error) {
        throw error;
      }

      return (response ?? {}) as RegisterResponse;
    },
  });
}

/**
 * Hook for forgot password request.
 *
 * Calls POST /api/v1/auth/forgot-password
 * Always returns success to prevent email enumeration.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (
      data: ForgotPasswordRequest
    ): Promise<ForgotPasswordResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Always return success message to prevent enumeration
      }

      return {
        message: "Si el email existe, recibirás un enlace de recuperación",
      };
    },
  });
}

/**
 * Hook for email verification.
 *
 * Calls POST /api/v1/auth/verify-email
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al verificar el correo electrónico");
      }

      return { verified: true };
    },
  });
}

/**
 * Hook for phone OTP verification.
 *
 * Calls POST /api/v1/auth/verify-phone
 */
export function useVerifyPhone() {
  return useMutation({
    mutationFn: async (data: VerifyPhoneRequest): Promise<VerifyPhoneResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: data.phone, otp: data.otp }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Código de verificación incorrecto");
      }

      return { verified: true };
    },
  });
}
