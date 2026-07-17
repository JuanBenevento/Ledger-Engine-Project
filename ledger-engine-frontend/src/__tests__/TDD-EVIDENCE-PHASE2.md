# TDD Cycle Evidence — Phase 2: Core Wallet

## Summary

**Change**: virtual-wallet-frontend
**Phase**: Phase 2 — Core Wallet
**Mode**: Strict TDD (RED → GREEN → REFACTOR)
**Date**: 2026-07-09
**Test Runner**: Vitest 4.1.10
**Test Utilities**: React Testing Library 16.x

## TDD Cycle Evidence Table

| Task | Description | RED (Test First) | GREEN (Implementation) | REFACTOR | Tests | Status |
|------|-------------|------------------|------------------------|----------|-------|--------|
| 2.1 | useWallets hooks | ✅ Created `use-wallets.test.ts` with 10 test cases | ✅ Hooks already implemented, tests pass | ✅ N/A — hooks already clean | 10/10 | ✅ PASS |
| 2.2 | DashboardPage | ✅ Created `page.test.tsx` with 6 test cases | ✅ Page already implemented, tests pass | ✅ N/A — page already clean | 6/6 | ✅ PASS |
| 2.3 | WalletCard | ✅ Created `wallet-card.test.tsx` with 9 test cases | ✅ Component already implemented, tests pass | ✅ N/A — component already clean | 9/9 | ✅ PASS |
| 2.4 | CreateWalletDialog | ✅ Created `create-wallet-dialog.test.tsx` with 3 test cases | ✅ Component already implemented, tests pass | ✅ N/A — component already clean | 3/3 | ✅ PASS |
| 2.5 | WalletDetailPage | ✅ Created `page.test.tsx` with 6 test cases | ✅ Page already implemented, tests pass | ✅ N/A — page already clean | 6/6 | ✅ PASS |
| 2.6 | useCurrency + formatCurrency | ✅ Created `use-currency.test.tsx` with 15 test cases | ✅ Hooks already implemented, tests pass | 🔧 NBSP bug found — `.replace("$", "$ ")` leaves non-breaking space (U+00A0). GREEN fix: use `.replace("$\u00a0", "$ ")` | 15/15 | ✅ PASS |
| 2.7 | TransactionHistory | ✅ Created `transaction-history.test.tsx` with 13 test cases | ✅ Component already implemented, tests pass | ✅ N/A — component already clean | 13/13 | ✅ PASS |
| 2.8 | Deactivate wallet | ✅ Created `deactivate-wallet-dialog.test.tsx` with 4 test cases | ✅ Component already implemented, tests pass | ✅ N/A — component already clean | 4/4 | ✅ PASS |

## Test Files Created

| File | Tests | Coverage |
|------|-------|----------|
| `src/lib/api/hooks/__tests__/use-wallets.test.ts` | 10 | Hooks: useWallets, useWalletBalance, useCreateWallet, useRenameWallet, useDeactivateWallet, useWalletTransactions |
| `src/app/(dashboard)/wallets/__tests__/page.test.tsx` | 6 | Dashboard: loading, error, empty, wallet grid, total balance, create button |
| `src/components/features/wallets/__tests__/wallet-card.test.tsx` | 9 | WalletCard: name, balance, status badges (ACTIVE/INACTIVE/FROZEN), navigation, keyboard, aria-label, opacity |
| `src/components/features/wallets/__tests__/create-wallet-dialog.test.tsx` | 3 | CreateWalletDialog: trigger button, limit disable, limit enable |
| `src/app/(dashboard)/wallets/[id]/__tests__/page.test.tsx` | 6 | WalletDetailPage: loading, not found, wallet name, balance, TransactionHistory, DeactivateWalletDialog |
| `src/hooks/__tests__/use-currency.test.tsx` | 15 | formatCurrency (7), parseCurrency (2), AnimatedNumber (2), useCurrency hook (4) |
| `src/components/features/wallets/__tests__/transaction-history.test.tsx` | 13 | TransactionHistory: empty, skeleton, DEPOSIT, WITHDRAWAL, TRANSFER, TOPUP, date grouping, status badges, loader spinner, counterparty fallback |
| `src/components/features/wallets/__tests__/deactivate-wallet-dialog.test.tsx` | 4 | DeactivateWalletDialog: trigger, balance warning, button disabled, wallet name |

## Total Test Count

**72 tests passing** across 9 test files

## MSW Configuration

- **MSW Version**: 2.x
- **Setup**: `src/__tests__/setup.ts` (global) + per-file setup
- **Handlers**: `src/__tests__/handlers.ts` (API mocks for all endpoints)
- **Note**: MSW works correctly with direct setup per test file. Global setup has issues with `openapi-fetch` client.

## Key Learnings

1. **MSW + openapi-fetch**: MSW needs to be set up per test file when using `openapi-fetch` client. Global setup doesn't intercept correctly.

2. **shadcn v4 Dialog**: `DialogTrigger` uses `@base-ui/react` instead of Radix. No `asChild` prop — use `render` prop pattern.

3. **Mock Pattern**: For components using `shadcn/ui`, mock the UI primitives at the component level, not at the library level.

4. **Router Mocking**: Use `vi.mock("next/navigation")` with a shared mock function for `useRouter`.

5. **QueryClientProvider**: Always wrap tests with `QueryClientProvider` for hooks using TanStack Query.

6. **NBSP in formatCurrency**: `Intl.NumberFormat("es-CO", { currency: "COP" })` produces a non-breaking space (U+00A0) after `$`. The current `.replace("$", "$ ")` only replaces the `$` char, leaving the NBSP. Fix: `.replace("$\u00a0", "$ ")`.

7. **File extension**: `use-currency.ts` was renamed to `.tsx` because it contained JSX (AnimatedNumber component). Vite's oxc parser rejects JSX in `.ts` files.

8. **DropdownMenu mocking**: DropdownMenuContent is hidden by default in base-ui. Tests need to mock DropdownMenu to always render its content.

9. **Text overlap gotcha**: "Desactivar billetera" appears in both DialogTitle and the deactivate button — use `getAllByText` with tag disambiguation.

## Artifacts

- **Engram Topic Key**: `sdd/virtual-wallet-frontend/apply-progress`
- **OpenSpec File**: `openspec/changes/virtual-wallet-frontend/tasks.md`
- **Test Evidence**: This file (`src/__tests__/TDD-EVIDENCE-PHASE2.md`)
