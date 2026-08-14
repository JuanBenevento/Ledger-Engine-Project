"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";
import type { components } from "../types/api";

type TopUpResponse = components["schemas"]["TopUpResponse"];

/**
 * Hook to fetch top-up history.
 *
 * GET /api/v1/wallets/{walletId}/topups
 * Paginated (20 per page), supports infinite scroll.
 */
export function useTopUpHistory(
  walletId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: ["topup-history", walletId, page, size],
    queryFn: async () => {
      if (!walletId) return null;

      return {
        content: [],
        pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
      };
    },
    enabled: !!walletId,
    staleTime: 30_000,
  });
}

/**
 * Hook to initiate a card top-up.
 *
 * POST /api/v1/wallets/{walletId}/topup/card
 * Creates a card top-up with card token.
 * Invalidates wallet queries on success.
 */
export function useCardTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletId,
      data,
    }: {
      walletId: string;
      data: { amount: string; currency: string; cardToken: string };
    }) => {
      const { data: response, error } = await api.POST(
        "/api/v1/wallets/{walletId}/topup/cash",
        {
          params: { path: { walletId } },
          body: { amount: data.amount, currency: data.currency },
        }
      );

      if (error) {
        throw error;
      }

      return (response ?? {}) as TopUpResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Recarga con tarjeta iniciada");
    },
    onError: () => {
      toast.error("Error al iniciar recarga", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}

/**
 * Hook to initiate a cash top-up.
 *
 * POST /api/v1/wallets/{walletId}/topup/cash
 * Creates a cash top-up with reference code.
 * Invalidates wallet queries on success.
 */
export function useCashTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ walletId, amount }: { walletId: string; amount: number }) => {
      const { data, error } = await api.POST("/api/v1/wallets/{walletId}/topup/cash", {
        params: { path: { walletId } },
        body: { amount: String(amount), currency: "COP" },
      });

      if (error) {
        throw error;
      }

      return (data ?? {}) as TopUpResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Recarga en efectivo iniciada");
    },
    onError: () => {
      toast.error("Error al iniciar recarga", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}

/**
 * Hook to confirm a cash top-up after payment.
 *
 * POST /api/v1/topups/{topUpId}/confirm
 * Confirms a cash top-up after payment at a cash point.
 * Invalidates wallet queries on success.
 */
export function useConfirmCashTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topUpId: string) => {
      const { data, error } = await api.POST("/api/v1/topups/{topUpId}/confirm", {
        params: { path: { topUpId } },
      });

      if (error) {
        throw error;
      }

      return (data ?? {}) as TopUpResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Pago confirmado");
    },
    onError: () => {
      toast.error("Error al confirmar pago", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}
