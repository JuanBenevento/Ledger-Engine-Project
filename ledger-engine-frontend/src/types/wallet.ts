/**
 * Wallet-related types for the Virtual Wallet Frontend.
 *
 * These types complement the auto-generated API types.
 */

export interface Wallet {
  walletId: string;
  name: string;
  currency: string;
  status: WalletStatus;
  createdAt?: string;
}

export type WalletStatus = "ACTIVE" | "INACTIVE" | "FROZEN";

export interface WalletBalance {
  walletId: string;
  available: number;
  pending: number;
  currency: string;
  lastUpdated?: string;
}

export interface CreateWalletInput {
  name: string;
  currency: string;
}

export interface Transaction {
  transactionId: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  status: TransactionStatus;
  createdAt: string;
  counterparty?: {
    name?: string;
    email?: string;
  };
}

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "TOPUP" | "PAYMENT";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface TransactionPage {
  content: Transaction[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
