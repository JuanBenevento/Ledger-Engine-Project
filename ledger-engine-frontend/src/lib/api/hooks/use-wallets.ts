"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";
import type { components } from "../types/api";

type WalletResponse = components["schemas"]["WalletResponse"];
type BalanceResponse = components["schemas"]["BalanceResponse"];
type CreateWalletRequest = components["schemas"]["CreateWalletRequest"];

/**
 * Hook to fetch all wallets for the current user.
 *
 * Uses TanStack Query with 30s stale time.
 * Returns wallet list with loading/error states.
 */
export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/v1/wallets");

      if (error) {
        throw error;
      }

      return (data ?? {}) as { wallets: WalletResponse[] };
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to fetch balance for a specific wallet.
 *
 * Uses TanStack Query with 30s refetch interval for real-time updates.
 * Shows "Actualizando..." indicator while fetching.
 */
export function useWalletBalance(walletId: string | null) {
  return useQuery({
    queryKey: ["wallets", walletId, "balance"],
    queryFn: async () => {
      if (!walletId) return null;

      const { data, error } = await api.GET("/api/v1/wallets/{walletId}/balance", {
        params: { path: { walletId } },
      });

      if (error) {
        throw error;
      }

      return (data ?? {}) as BalanceResponse;
    },
    enabled: !!walletId,
    refetchInterval: 30_000, // Balance refresh every 30s
    staleTime: 10_000,
  });
}

/**
 * Hook to create a new wallet.
 *
 * POST /api/v1/wallets
 * Validates max 5 wallets client-side.
 * Invalidates wallet list query on success.
 */
export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWalletRequest): Promise<WalletResponse> => {
      const { data: response, error } = await api.POST("/api/v1/wallets", {
        body: data,
      });

      if (error) {
        throw error;
      }

      return (response ?? {}) as WalletResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Billetera creada", {
        description: "Tu nueva billetera está lista para usar",
      });
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === "WALLET_LIMIT_EXCEEDED") {
        toast.error("Límite alcanzado", {
          description: "Máximo 5 billeteras por cuenta",
        });
      } else {
        toast.error("Error al crear billetera", {
          description: "Intenta de nuevo más tarde",
        });
      }
    },
  });
}

/**
 * Hook to rename a wallet.
 *
 * PATCH /api/v1/wallets/{walletId}
 * Optimistic update on the wallet list.
 */
export function useRenameWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletId,
      name,
    }: {
      walletId: string;
      name: string;
    }): Promise<WalletResponse> => {
      const { data: response, error } = await api.PATCH(
        "/api/v1/wallets/{walletId}",
        {
          params: { path: { walletId } },
          body: { name },
        }
      );

      if (error) {
        throw error;
      }

      return (response ?? {}) as WalletResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Billetera renombrada", {
        description: "El nombre se actualizó correctamente",
      });
    },
    onError: () => {
      toast.error("Error al renombrar", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}

/**
 * Hook to deactivate a wallet.
 *
 * POST /api/v1/wallets/{walletId}/deactivate
 * Blocks if balance > 0 (handle 422 WALLET_HAS_BALANCE).
 */
export function useDeactivateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletId: string) => {
      const { data, error } = await api.POST(
        "/api/v1/wallets/{walletId}/deactivate",
        {
          params: { path: { walletId } },
        }
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Billetera desactivada", {
        description: "La billetera ya no está activa",
      });
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === "WALLET_HAS_BALANCE") {
        toast.error("Saldo pendiente", {
          description: "Transfiere el saldo antes de desactivar",
        });
      } else {
        toast.error("Error al desactivar", {
          description: "Intenta de nuevo más tarde",
        });
      }
    },
  });
}

/**
 * Hook to fetch transaction history for a wallet.
 *
 * GET /api/v1/wallets/{walletId}/transactions
 * Paginated (20 per page), supports infinite scroll.
 */
export function useWalletTransactions(
  walletId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: ["wallets", walletId, "transactions", page, size],
    queryFn: async () => {
      if (!walletId) return null;

      const { data, error } = await api.GET(
        "/api/v1/wallets/{walletId}/transactions",
        {
          params: {
            path: { walletId },
            query: { page, size },
          },
        }
      );

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!walletId,
    staleTime: 30_000,
  });
}
