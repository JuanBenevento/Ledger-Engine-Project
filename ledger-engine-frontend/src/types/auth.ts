/**
 * Auth-related types for the Virtual Wallet Frontend.
 *
 * These types complement the auto-generated API types.
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  phone: string;
  status: "PENDING_VERIFICATION";
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
}

export interface VerifyPhoneRequest {
  phone: string;
  otp: string;
}

export interface VerifyPhoneResponse {
  verified: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}
