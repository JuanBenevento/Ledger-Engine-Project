/**
 * React Query hooks for API integration.
 *
 * These hooks wrap openapi-fetch calls with TanStack Query for:
 * - Automatic caching and revalidation
 * - Optimistic updates
 * - Error handling
 * - Loading states
 */

export {
  useWallets,
  useWalletBalance,
  useCreateWallet,
  useRenameWallet,
  useDeactivateWallet,
  useWalletTransactions,
} from "./use-wallets";

export { useTopUpHistory, useCashTopUp, useConfirmCashTopUp, useCardTopUp } from "./use-topups";

export { useRecipientSearch, useTransfer, useTransferHistory, useCreateTransfer } from "./use-transfers";

export { useFavoriteBillers, useBillPaymentHistory, usePayBill, useBillerSearch } from "./use-bills";

export { useGenerateQr } from "./use-qr";

export {
  useRegister,
  useForgotPassword,
  useVerifyEmail,
  useVerifyPhone,
} from "./use-auth-api";
