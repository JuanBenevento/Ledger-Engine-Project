"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../client";

type TwoFAEnableResponse = {
  secret: string;
  provisioningUri: string;
  qrCodeUrl: string;
};

type TwoFAVerifyResponse = {
  enabled: boolean;
  backupCodes: string[];
};

type Device = {
  deviceId: string;
  name: string;
  os: string;
  browser: string;
  lastLoginAt: string;
  isCurrentDevice: boolean;
  trusted: boolean;
};

/**
 * Hook to enable 2FA — returns QR code and provisioning URI.
 *
 * POST /api/v1/security/2fa/enable
 */
export function useEnable2FA() {
  return useMutation({
    mutationFn: async (): Promise<TwoFAEnableResponse> => {
      const { data, error } = await api.POST("/api/v1/security/2fa/enable");

      if (error) {
        throw error;
      }

      return (data ?? {}) as TwoFAEnableResponse;
    },
  });
}

/**
 * Hook to verify 2FA code and activate 2FA.
 *
 * POST /api/v1/security/2fa/verify
 */
export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string): Promise<TwoFAVerifyResponse> => {
      const { data, error } = await api.POST("/api/v1/security/2fa/verify", {
        body: { code },
      });

      if (error) {
        throw error;
      }

      return (data ?? {}) as TwoFAVerifyResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "2fa"] });
      toast.success("2FA habilitado", {
        description: "Tu cuenta ahora está más segura",
      });
    },
    onError: () => {
      toast.error("Código inválido", {
        description: "Verifica el código e intenta de nuevo",
      });
    },
  });
}

/**
 * Hook to disable 2FA.
 *
 * POST /api/v1/security/2fa/disable
 */
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await api.POST("/api/v1/security/2fa/disable", {
        body: { code },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "2fa"] });
      toast.success("2FA deshabilitado", {
        description: "Tu cuenta ya no requiere código de verificación",
      });
    },
    onError: () => {
      toast.error("Código inválido", {
        description: "Verifica el código e intenta de nuevo",
      });
    },
  });
}

/**
 * Hook to fetch trusted devices.
 *
 * GET /api/v1/security/devices
 */
export function useDevices() {
  return useQuery({
    queryKey: ["security", "devices"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/v1/security/devices");

      if (error) {
        throw error;
      }

      return (data ?? { devices: [] }) as { devices: Device[] };
    },
    staleTime: 30_000,
  });
}

/**
 * Hook to revoke a device.
 *
 * DELETE /api/v1/security/devices/{deviceId}
 */
export function useRevokeDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { data, error } = await api.DELETE(
        "/api/v1/security/devices/{deviceId}",
        {
          params: { path: { deviceId } },
        }
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "devices"] });
      toast.success("Dispositivo revocado", {
        description: "El dispositivo ya no tiene acceso a tu cuenta",
      });
    },
    onError: () => {
      toast.error("Error al revocar", {
        description: "Intenta de nuevo más tarde",
      });
    },
  });
}
