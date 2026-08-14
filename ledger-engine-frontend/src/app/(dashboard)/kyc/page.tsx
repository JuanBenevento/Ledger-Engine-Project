"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  useKYCStatus,
  useSubmitKYC,
  useResubmitKYC,
} from "@/lib/api/hooks/use-kyc";
import { DocumentUpload } from "@/components/features/kyc/document-upload";

const KYC_STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "En revisión",
    color: "bg-blue-100 text-blue-800",
    icon: FileText,
  },
  APPROVED: {
    label: "Aprobado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
} as const;

/**
 * KYCPage
 *
 * Displays KYC verification status with document upload form.
 * Shows rejection reason when status is REJECTED.
 * Polls status every 30s while UNDER_REVIEW.
 */
export default function KYCPage() {
  const { data: kycData, isLoading } = useKYCStatus();
  const submitKYC = useSubmitKYC();
  const resubmitKYC = useResubmitKYC();
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const status = kycData?.status ?? "PENDING";
  const statusConfig = KYC_STATUS_CONFIG[status] ?? KYC_STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  const handleUpload = useCallback(
    async (files: File[]) => {
      try {
        await submitKYC.mutateAsync({ documents: files });
        setShowUploadDialog(false);
      } catch {
        // Error handled by mutation
      }
    },
    [submitKYC]
  );

  const handleResubmit = useCallback(
    async (files: File[]) => {
      try {
        await resubmitKYC.mutateAsync({ documents: files });
        setShowUploadDialog(false);
      } catch {
        // Error handled by mutation
      }
    },
    [resubmitKYC]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verificación KYC</h1>
        <p className="text-sm text-muted-foreground">
          Verifica tu identidad para desbloquear todas las funciones
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Estado de verificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            {status === "PENDING" && (
              <p className="text-sm text-muted-foreground">
                Sube tus documentos para comenzar la verificación
              </p>
            )}
            {status === "UNDER_REVIEW" && (
              <p className="text-sm text-muted-foreground">
                Tu solicitud está siendo revisada. Esto puede tomar hasta 24
                horas.
              </p>
            )}
            {status === "APPROVED" && (
              <p className="text-sm text-green-600">
                ¡Tu identidad ha sido verificada! Ya puedes acceder a todas las
                funciones.
              </p>
            )}
            {status === "REJECTED" && kycData?.rejectionReason && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {kycData.rejectionReason}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      {(status === "PENDING" || status === "REJECTED") && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {status === "REJECTED"
                ? "Sube nuevos documentos para rechazar la verificación"
                : "Sube una foto de tu documento de identidad (cédula, pasaporte o licencia)"}
            </p>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger render={<Button />}>
                <Upload className="mr-2 h-4 w-4" />
                {status === "REJECTED" ? "Rechazar documentos" : "Subir documentos"}
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Subir documentos KYC</DialogTitle>
                </DialogHeader>
                <DocumentUpload
                  onUpload={status === "REJECTED" ? handleResubmit : handleUpload}
                  isPending={submitKYC.isPending || resubmitKYC.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Document Preview */}
      {kycData?.documents && kycData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kycData.documents.map((doc, index) => (
                <div
                  key={doc.id ?? index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{doc.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
