"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CameraIcon, UploadIcon, KeyboardIcon } from "lucide-react";

/**
 * QRPayPage — Page for scanning/reading QR codes to make payments.
 *
 * Features:
 * - Camera viewfinder (simulated placeholder)
 * - Permission handling (shows message if denied)
 * - Manual entry fallback (text input for QR code)
 * - File upload from gallery (fallback)
 * - On scan/read, navigates to QRPaymentConfirm
 */
export default function QRPayPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt");

  // Camera permission check
  React.useEffect(() => {
    const checkCamera = async () => {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          setCameraPermission("granted");
        } else {
          setCameraPermission("denied");
        }
      } catch {
        setCameraPermission("denied");
      }
    };
    checkCamera();
  }, []);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      // Navigate to confirm page with scanned data
      router.push(
        `/qr/confirm?codeId=${encodeURIComponent(manualCode)}`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate QR read from image
      const url = URL.createObjectURL(file);
      // In real app, would decode QR from image
      router.push(`/qr/confirm?codeId=uploaded-${file.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Escanear código QR</h1>
        <p className="text-muted-foreground">
          Apunta la cámara al código QR o ingresa el código manualmente
        </p>
      </div>

      {/* Camera Viewfinder Placeholder */}
      <div className="relative aspect-square max-w-sm mx-auto rounded-xl border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center gap-4">
        {cameraPermission === "granted" ? (
          <>
            <div className="h-48 w-48 border-2 border-primary/50 rounded-lg flex items-center justify-center">
              <CameraIcon className="h-16 w-16 text-primary/40" />
            </div>
            <p className="text-sm text-muted-foreground">Cámara activa</p>
          </>
        ) : cameraPermission === "denied" ? (
          <>
            <CameraIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm font-medium text-destructive">
              Permiso de cámara requerido
            </p>
            <p className="text-xs text-muted-foreground text-center px-4">
              Habilita el permiso de cámara en la configuración de tu navegador
            </p>
          </>
        ) : (
          <>
            <CameraIcon className="h-16 w-16 text-muted-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Inicializando cámara...</p>
          </>
        )}
      </div>

      {/* Manual Entry Fallback */}
      <div className="space-y-2">
        <Label htmlFor="qr-manual">Ingresar código manualmente</Label>
        <div className="flex gap-2">
          <Input
            id="qr-manual"
            type="text"
            placeholder="Ej: QR-ABC-123"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleManualSubmit();
            }}
          />
          <Button
            onClick={handleManualSubmit}
            disabled={!manualCode.trim()}
            variant="outline"
          >
            <KeyboardIcon className="h-4 w-4 mr-2" />
            Ingresar
          </Button>
        </div>
      </div>

      {/* File Upload Fallback */}
      <div className="space-y-2">
        <Label>Subir imagen del código QR</Label>
        <label
          htmlFor="qr-upload"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-8 px-4",
            "border-2 border-dashed rounded-lg cursor-pointer",
            "hover:bg-muted/50 transition-colors"
          )}
        >
          <UploadIcon className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Seleccionar imagen del QR
          </span>
        </label>
        <input
          id="qr-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
