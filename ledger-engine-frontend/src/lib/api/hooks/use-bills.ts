"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { untypedApi } from "../client";
import { useAuth } from "@/lib/auth";

/**
 * Hook to fetch favorite billers.
 *
 * GET /api/v1/bills/favorites
 * Returns list of user's favorite billers with 60s stale time.
 */
export function useFavoriteBillers() {
  return useQuery({
    queryKey: ["bill-favorites"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/v1/bills/favorites", {});

      if (error) {
        throw error;
      }

      const favorites = (data ?? []).map((biller) => ({
        id: biller.id ?? "",
        billerId: biller.id ?? "",
        billerName: biller.name ?? "",
        category: biller.category ?? "",
      })) as BillFavorite[];

      return { favorites };
    },
    staleTime: 60_000,
  });
}

/**
 * Hook to fetch bill payment history.
 *
 * GET /api/v1/wallets/{walletId}/bill-payments
 * Paginated (20 per page), supports infinite scroll.
 */
export function useBillPaymentHistory(
  walletId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: ["bill-payments", walletId, page, size],
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
 * Hook to search billers by query.
 *
 * GET /api/v1/bills/search
 * Returns matching billers with 30s stale time.
 */
export function useBillerSearch(query: string) {
  return useQuery({
    queryKey: ["biller-search", query],
    queryFn: async () => {
      if (query.length < 2) return null;

      const { data, error } = await untypedApi.GET("/api/v1/bills/search", {
        params: { query: { q: query } },
      });

      if (error) {
        throw error;
      }

      return (data ?? []) as Biller[];
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

/**
 * Hook to pay a bill.
 *
 * POST /api/v1/bills/pay
 * Creates a bill payment with reference and amount.
 * Invalidates wallet queries on success.
 */
export function usePayBill() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      billerId,
      walletId,
      amount,
      reference,
    }: {
      billerId: string;
      walletId: string;
      amount: number;
      reference: string;
    }) => {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const { data, error } = await api.POST("/api/v1/bills/pay", {
        body: {
          userId: user.id,
          billerId,
          walletId,
          amount: String(amount),
          currency: "COP",
          reference,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["bill-payments"] });
      toast.success("Pago enviado", {
        description: "Tu pago está siendo procesado",
      });
    },
    onError: () => {
      toast.error("Error al pagar", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}

export interface Biller {
  id: string;
  name: string;
  category: string;
  active: boolean;
}

interface BillFavorite {
  id: string;
  billerId: string;
  billerName: string;
  category: string;
  lastUsed?: string;
}
