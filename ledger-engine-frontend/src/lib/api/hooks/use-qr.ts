"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";
import type { components } from "../types/api";

type GenerateQrResponse = components["schemas"]["GenerateQrResponse"];

interface GenerateQrParams {
  walletId: string;
  amount?: number;
  currency?: string;
}

/**
 * Hook to generate a QR code for payment collection.
 *
 * POST /api/v1/qr/generate
 * Returns QR image base64, expiry, and metadata.
 * Shows toast on success.
 */
export function useGenerateQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateQrParams): Promise<GenerateQrResponse> => {
      const { data: response, error } = await api.POST("/api/v1/qr/generate", {
        body: {
          walletId: data.walletId,
          userId: "current-user",
          type: data.amount ? "FIXED" : "DYNAMIC",
          amount: data.amount ? String(data.amount) : undefined,
          currency: data.currency || "COP",
          ttlSeconds: 900,
        },
      });

      if (error) {
        throw error;
      }

      return (response ?? {}) as GenerateQrResponse;
    },
    onSuccess: () => {
      toast.success("QR generado exitosamente");
    },
    onError: () => {
      toast.error("Error al generar QR", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}

interface PayQrParams {
  qrCodeId: string;
  payerWalletId: string;
  payerUserId: string;
  amount?: string;
  hmacPayload: string;
}

/**
 * Hook to pay via QR code.
 *
 * POST /api/v1/qr/pay
 * Processes QR payment with recipient and amount.
 * Handles QR_EXPIRED and INSUFFICIENT_FUNDS errors.
 */
export function usePayQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      qrCodeId: string;
      payerWalletId: string;
      amount?: number;
      hmacPayload: string;
    }) => {
      const { data: response, error } = await api.POST("/api/v1/qr/pay", {
        body: {
          qrCodeId: data.qrCodeId,
          payerWalletId: data.payerWalletId,
          payerUserId: "current-user",
          amount: data.amount ? String(data.amount) : undefined,
          hmacPayload: data.hmacPayload,
        },
      });

      if (error) {
        throw error;
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Pago QR completado");
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === "QR_EXPIRED") {
        toast.error("QR expirado", {
          description: "Genera un nuevo código QR",
        });
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Saldo insuficiente", {
          description: "Recarga tu billetera",
        });
      } else {
        toast.error("Error al pagar");
      }
    },
  });
}
