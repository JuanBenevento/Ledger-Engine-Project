"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateWallet, useWallets } from "@/lib/api/hooks/use-wallets";
import { useAuth } from "@/lib/auth";

/**
 * Zod schema for wallet creation form.
 */
const createWalletSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
});

type CreateWalletFormData = z.infer<typeof createWalletSchema>;

const MAX_WALLETS = 5;

interface CreateWalletDialogProps {
  children?: React.ReactNode;
}

/**
 * CreateWalletDialog molecule.
 *
 * Form dialog for creating a new wallet.
 *
 * Features:
 * - Name input with validation
 * - POST /api/v1/wallets
 * - Max 5 wallets validation (client + server)
 * - Success toast
 * - Query invalidation on success
 */
export function CreateWalletDialog({ children: _children }: CreateWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: walletsData } = useWallets();
  const { user } = useAuth();
  const createWallet = useCreateWallet();

  const walletCount = walletsData?.wallets?.length ?? 0;
  const isAtLimit = walletCount >= MAX_WALLETS;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CreateWalletFormData) => {
    if (isAtLimit || !user?.id) return;

    try {
      await createWallet.mutateAsync({
        userId: user.id,
        name: data.name,
        currency: "COP",
      });

      reset();
      setOpen(false);
    } catch {
      // Error handled by useCreateWallet hook
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && isAtLimit) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button disabled={isAtLimit}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nueva billetera
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva billetera</DialogTitle>
          <DialogDescription>
            Dale un nombre a tu billetera para identificarla fácilmente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Nombre de la billetera</Label>
            <Input
              id="wallet-name"
              placeholder="Ej: Ahorro, Viajes, Negocios"
              disabled={isSubmitting}
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "wallet-name-error" : undefined}
            />
            {errors.name && (
              <p id="wallet-name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {isAtLimit && (
            <p className="text-sm text-destructive">
              Has alcanzado el límite de {MAX_WALLETS} billeteras.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isAtLimit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear billetera"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
