"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";
import type { components } from "../types/api";

type TransferResponse = components["schemas"]["TransferResponse"];

/**
 * Hook to search for a recipient by email or phone.
 *
 * GET /api/v1/p2p/recipients/search
 * Returns resolved recipient user or null.
 */
export function useRecipientSearch(query: string) {
  return useQuery({
    queryKey: ["recipient-search", query],
    queryFn: async () => {
      if (query.length < 3) return null;

      const { data, error } = await api.GET("/api/v1/p2p/recipients/search", {
        params: { query: { q: query } },
      });

      if (error) {
        throw error;
      }

      return (data ?? null) as { userId: string; name: string; email: string; avatar: string | null } | null;
    },
    enabled: query.length >= 3,
    staleTime: 30_000,
  });
}

/**
 * Hook to initiate a P2P transfer.
 *
 * POST /api/v1/transfers
 * Creates a transfer between accounts.
 * Invalidates wallet and transfer queries on success.
 */
export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipientEmail,
      amount,
      walletId,
      description,
    }: {
      recipientEmail: string;
      amount: number;
      walletId: string;
      description?: string;
    }) => {
      const { data, error } = await api.POST("/api/v1/p2p/transfers", {
        body: {
          recipientEmail,
          amount,
          currency: "COP",
          sourceAccountId: walletId,
          description,
        },
      });

      if (error) {
        throw error;
      }

      return (data ?? {}) as TransferResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transferencia enviada", {
        description: "La transferencia se completó exitosamente",
      });
    },
    onError: () => {
      toast.error("Error al transferir", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}

/**
 * Hook to fetch transfer history for P2P transfers.
 *
 * GET /api/v1/p2p/transfers
 * Paginated (20 per page), supports infinite scroll.
 */
export function useTransferHistory(
  walletId: string | null,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: ["transfers", walletId, page, size],
    queryFn: async () => {
      if (!walletId) return null;

      const { data, error } = await api.GET("/api/v1/p2p/transfers", {
        params: { query: { page, size } },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!walletId,
    staleTime: 30_000,
  });
}

/**
 * Hook to initiate a P2P transfer.
 *
 * POST /api/v1/transfers
 * Creates a transfer between accounts.
 * Invalidates wallet and transfer queries on success.
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceWalletId,
      targetAccountId,
      amount,
      description,
    }: {
      sourceWalletId: string;
      targetAccountId: string;
      amount: number;
      description?: string;
    }) => {
      const { data, error } = await api.POST("/api/v1/transfers", {
        body: {
          sourceAccountId: sourceWalletId,
          targetAccountId,
          amount: String(amount),
          currency: "COP",
          description,
        },
      });

      if (error) {
        throw error;
      }

      return (data ?? {}) as TransferResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transferencia enviada", {
        description: "La transferencia se completó exitosamente",
      });
    },
    onError: () => {
      toast.error("Error al transferir", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}
