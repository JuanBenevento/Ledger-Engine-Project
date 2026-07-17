import { z } from "zod";

/**
 * Auth validation schemas for forms.
 *
 * All messages in Spanish for LATAM fintech product.
 * Phone validation uses E.164 format with Colombian prefix (+57).
 */

// ============================================
// Login Schema
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Register Schema
// ============================================

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingresa un correo electrónico válido"),
    firstName: z
      .string()
      .min(1, "El nombre es requerido")
      .max(50, "El nombre no puede tener más de 50 caracteres"),
    lastName: z
      .string()
      .min(1, "El apellido es requerido")
      .max(50, "El apellido no puede tener más de 50 caracteres"),
    phone: z
      .string()
      .min(1, "El número de teléfono es requerido")
      .regex(
        /^\+57[3][0-9]{9}$/,
        "Ingresa un número celular colombiano válido (ej: +573001234567)"
      ),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
      )
      .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula"
      )
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.literal(true, {
      error: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// Forgot Password Schema
// ============================================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================
// Reset Password Schema
// ============================================

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
      )
      .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula"
      )
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// Verify Phone OTP Schema
// ============================================

export const verifyPhoneSchema = z.object({
  otp: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^[0-9]+$/, "El código solo debe contener números"),
});

export type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;

// ============================================
// Password Strength Helper
// ============================================

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: PasswordStrengthLevel;
  label: string;
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const cappedScore = Math.min(score, 4) as PasswordStrengthLevel;

  const levels: Record<PasswordStrengthLevel, Omit<PasswordStrength, "score">> = {
    0: { label: "Muy débil", color: "bg-red-500" },
    1: { label: "Débil", color: "bg-orange-500" },
    2: { label: "Regular", color: "bg-yellow-500" },
    3: { label: "Fuerte", color: "bg-lime-500" },
    4: { label: "Muy fuerte", color: "bg-green-500" },
  };

  return {
    score: cappedScore,
    ...levels[cappedScore],
  };
}
