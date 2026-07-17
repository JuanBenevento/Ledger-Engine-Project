"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";
import type { components } from "../types/api";

type KYCStatusResponse = components["schemas"]["KYCStatusResponse"];
type KYCDocument = components["schemas"]["KYCDocument"];

/**
 * Hook to fetch KYC status.
 *
 * GET /api/v1/kyc/status
 * Returns current KYC status and documents.
 */
export function useKYCStatus() {
  return useQuery({
    queryKey: ["kyc", "status"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/v1/kyc/status");

      if (error) {
        throw error;
      }

      return (data ?? { status: "PENDING", documents: [] }) as {
        status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
        documents: KYCDocument[];
        rejectionReason?: string;
      };
    },
    staleTime: 10_000, // 10 seconds
    refetchInterval: (query) => {
      // Poll every 30s while UNDER_REVIEW
      const status = query.state.data?.status;
      return status === "UNDER_REVIEW" ? 30_000 : false;
    },
  });
}

/**
 * Hook to submit KYC documents.
 *
 * POST /api/v1/kyc/submit
 * Submits documents for KYC verification.
 */
export function useSubmitKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documents }: { documents: File[] }) => {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("documents", doc);
      });

      const { data, error } = await api.POST("/api/v1/kyc/submit", {
        body: formData as any,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Documentos enviados", {
        description: "Tus documentos están siendo revisados",
      });
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudieron enviar los documentos",
      });
    },
  });
}

/**
 * Hook to resubmit KYC documents after rejection.
 *
 * POST /api/v1/kyc/resubmit
 * Submits new documents after a rejection.
 */
export function useResubmitKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documents }: { documents: File[] }) => {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("documents", doc);
      });

      const { data, error } = await api.POST("/api/v1/kyc/resubmit", {
        body: formData as any,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Documentos reenviados", {
        description: "Tus nuevos documentos están siendo revisados",
      });
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudieron reenviar los documentos",
      });
    },
  });
}
