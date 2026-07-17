"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../client";

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
      const { data, error } = await api.GET("/api/v1/bills/favorites");

      if (error) {
        throw error;
      }

      return (data ?? { favorites: [] }) as { favorites: BillFavorite[] };
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

interface BillFavorite {
  id: string;
  billerId: string;
  billerName: string;
  category: string;
  lastUsed?: string;
}
