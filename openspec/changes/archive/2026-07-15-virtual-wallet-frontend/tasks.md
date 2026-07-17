# Tasks: Virtual Wallet Frontend

## Phase 0: Foundation

- [x] 0.1 Initialize Next.js 14 project (App Router, TypeScript, Tailwind CSS) in `ledger-engine-frontend/`
- [x] 0.2 Install and configure shadcn/ui (components: button, card, input, dialog, toast, badge, skeleton, tabs, select, dropdown-menu, avatar)
- [x] 0.3 Copy `openapi.yaml` from backend, generate TypeScript types with `openapi-typescript`, setup `openapi-fetch` client in `src/lib/api-client.ts`
- [x] 0.4 Configure Keycloak: `@react-keycloak/web`, `KeycloakProvider` in `src/components/providers/`, httpOnly cookie flow, env vars (`NEXT_PUBLIC_KEYCLOAK_*`)
- [x] 0.5 Create root layout (`src/app/layout.tsx`): Inter font, providers wrapper (QueryClient, Keycloak, Theme), metadata, global styles
- [x] 0.6 Create auth layout (`src/app/(auth)/layout.tsx`): centered card, no sidebar. Create dashboard layout (`src/app/(dashboard)/layout.tsx`): sidebar + header shell
- [x] 0.7 Setup Zustand UI store (`src/stores/ui-store.ts`): sidebar open/close, dark mode toggle, locale
- [x] 0.8 Configure environment variables (`.env.local`): API URL, Keycloak URL/realm/client, Ably key. Create `vercel.json` with rewrites if needed
- [x] 0.9 Setup Vitest (`vitest.config.ts`) + React Testing Library + MSW for API mocking. Create test utils in `tests/helpers.tsx`

## Phase 1: Auth

- [x] 1.1 Create `LoginPage` (`src/app/(auth)/login/page.tsx`): email/password form, Keycloak redirect, error toast "Credenciales incorrectas", "Olvidaste tu contraseña?" link
- [x] 1.2 Create `RegisterPage`: email, phone (E.164 +57), firstName, lastName, password (min 8), password strength indicator, POST `/api/v1/auth/register`
- [x] 1.3 Create `ForgotPasswordPage`: single email input, always-shows-success message (anti-enumeration), Keycloak forgot-password flow
- [x] 1.4 Create `VerifyEmailPage`: auto-verify on load with token param, success/error states
- [x] 1.5 Create `VerifyPhonePage`: 6-digit OTP input, resend timer (60s), POST `/api/v1/auth/verify-phone`
- [x] 1.6 Implement token refresh: Keycloak auto-refresh 2min before expiry, `BroadcastChannel` for cross-tab sync, redirect to `/login` on refresh failure
- [x] 1.7 Create Next.js middleware (`src/middleware.ts`): check session cookie, redirect unauthenticated to `/login`, role-based route guards

## Phase 2: Core Wallet

- [x] 2.1 Create `useWallets`, `useWalletBalance` hooks (`src/hooks/use-wallets.ts`): TanStack Query, 30s stale time, balance refetch interval
- [x] 2.2 Create `DashboardPage` (`src/app/(dashboard)/wallets/page.tsx`): total balance hero, wallet grid, "Nueva billetera" CTA, skeleton loader, empty state
- [x] 2.3 Create `WalletCard` molecule: name, balance (COP formatted `$ 1.234.567`), status badge, animated balance change, click-to-detail
- [x] 2.4 Create `CreateWalletDialog`: name input, POST `/api/v1/wallets`, max 5 wallets validation, success toast, query invalidation
- [x] 2.5 Create `WalletDetailPage` (`src/app/(dashboard)/wallets/[id]/page.tsx`): balance hero, actions menu (rename, deactivate), transaction list
- [x] 2.6 Create `useCurrency` hook + `formatCurrency()`: COP locale, `$ 1.234.567` format, no decimals, animated number component
- [x] 2.7 Create `TransactionHistory` organism: paginated table (20/page), date grouping, type icons (DEPOSIT/WITHDRAWAL/TRANSFER), infinite scroll
- [x] 2.8 Implement deactivate wallet: confirmation dialog, POST `/api/v1/wallets/{id}/deactivate`, block if balance > 0, handle 422 WALLET_HAS_BALANCE

## Phase 3: TopUps

- [x] 3.1 Create `TopUpPage` (`src/app/(dashboard)/topup/page.tsx`): method selector (cards: Tarjeta, PSE, Efectivo), wallet selector, amount input (min 1,000 / max 10,000,000 COP)
- [x] 3.2 Create `CardTopUpForm`: card number, expiry, CVV, amount, submit, POST `/api/v1/wallets/{id}/topup`, sync response handling, success toast "Recarga exitosa"
- [x] 3.3 Create `PSEBankSelector` + PSE flow: bank list with search, amount input, redirect to bank page, 5s polling for status confirmation, handle success/cancellation
- [x] 3.4 Create `CashTopUpResult`: reference number (copyable), instructions "Paga en Baloto/Efecty", 24h expiry countdown, "Ya pagué" confirm button
- [x] 3.5 Create `TopUpHistory`: paginated table, method/status filters, date range picker, status badges (COMPLETED/PENDING/FAILED)

## Phase 4: P2P Transfers

- [x] 4.1 Create `TransferPage` (`src/app/(dashboard)/transfer/page.tsx`): recipient input with live search (debounce 300ms), amount input, source wallet selector
- [x] 4.2 Create `RecipientSearch` atom: email/phone input, POST search, show resolved user with avatar/name, "No se encontró usuario" error state
- [x] 4.3 Create `TransferConfirmationDialog`: summary (recipient, amount, note, source wallet), "Confirmar" button, duplicate transfer warning (10s window)
- [x] 4.4 Implement transfer mutation: POST `/api/v1/p2p/transfers`, optimistic balance deduction, rollback on error, handle 422 INSUFFICIENT_FUNDS/SELF_TRANSFER
- [x] 4.5 Create `TransferHistory`: tabs (Enviados/Recibidos), paginated table, status badges, date formatting, filter by type/date

## Phase 5: QR Payments

- [x] 5.1 Create `QRGeneratePage` (`src/app/(dashboard)/qr/page.tsx`): amount input (optional for dynamic), wallet selector, "Generar QR" button, POST `/api/v1/qr/generate`
- [x] 5.2 Create `QRDisplay` molecule: QR code image (base64), 15min countdown timer, download (PNG) button, native share button, expiry warning
- [x] 5.3 Create `QRPayPage`: camera viewfinder component, permission handling, manual entry fallback (file upload from gallery), scan validation
- [x] 5.4 Create `QRPaymentConfirm`: show recipient/amount from scanned QR, "Pagar" button, POST `/api/v1/qr/pay`, handle QR_EXPIRED/INSUFFICIENT_FUNDS
- [x] 5.5 Create `QRPaymentHistory`: paginated table, type badges (sent/received), amounts, dates, filters

## Phase 6: Bill Payments

- [x] 6.1 Create `BillPaymentPage` (`src/app/(dashboard)/bills/page.tsx`): biller search, favorites quick-access grid, payment form
- [x] 6.2 Create `BillerSearch` organism: searchable select with categories (Energía, Agua, Gas, Telecom), popular billers suggestion
- [x] 6.3 Create `BillPaymentForm`: reference number input (numeric, 6-20 chars), amount input, wallet selector, confirmation dialog
- [x] 6.4 Implement bill payment mutation: POST `/api/v1/bills/pay`, 202 async response, 5s polling for status, handle INSUFFICIENT_FUNDS/INVALID_REFERENCE
- [x] 6.5 Create `BillFavoritesList`: grid of favorite cards, add/remove, max 10 validation, pre-fill from favorites
- [x] 6.6 Create `BillPaymentHistory`: paginated table, biller icons, status badges (PROCESSING/COMPLETED/FAILED), biller/status filters

## Phase 7: Notifications

- [x] 7.1 Setup Ably integration (`src/lib/ably.ts`): channel `user:{userId}:notifications`, event handlers, exponential backoff reconnect, fallback to 60s polling
- [x] 7.2 Create `NotificationBell` atom: bell icon, unread count badge, dropdown preview (last 5), click to `/notifications`
- [x] 7.3 Create `NotificationList` page (`src/app/(dashboard)/notifications/page.tsx`): paginated inbox (50/page), "Marcar todo leído" button, type icons mapping
- [x] 7.4 Create `NotificationToast`: real-time popup from Ably events, auto-dismiss 5s, click to navigate to relevant page, batch flood (>10 in 1s)
- [x] 7.5 Create `NotificationPreferencesPage`: toggle grid (type × channel: push/email/sms), SECURITY_ALERT toggle disabled with tooltip

## Phase 8: Security & KYC

- [x] 8.1 Create `SecuritySettingsPage` (`src/app/(dashboard)/security/page.tsx`): 2FA section, device list, security log shell
- [x] 8.2 Create `TwoFactorSetup`: POST `/api/v1/security/2fa/enable`, display TOTP QR code + provisioning URI, 6-digit verification input, backup codes display (copy/download)
- [x] 8.3 Create `DeviceList`: device cards (name, OS, browser, last login, isCurrent badge), revoke button with confirmation dialog, POST delete
- [x] 8.4 Create `KYCPage` (`src/app/(dashboard)/kyc/page.tsx`): status display (PENDING/UNDER_REVIEW/APPROVED/REJECTED), document upload form, rejection reason display
- [x] 8.5 Create `DocumentUpload`: drag-and-drop zone, file preview, progress bar, validation (JPG/PNG, max 5MB), POST `/api/v1/kyc/submit` (FormData)
- [x] 8.6 Implement KYC status polling (30s while UNDER_REVIEW), auto-wallet creation notification on APPROVED, resubmit flow on REJECTED

## Phase 9: Polish & Deploy

- [x] 9.1 Create error boundaries for each route group (auth, dashboard), fallback UI with retry button
- [x] 9.2 Error boundary + retry UI (global error component with retry button, per-section error states)
- [x] 9.3 Build complete skeleton system: WalletCardSkeleton, TransactionListSkeleton, FormSkeleton, TableSkeleton — replace ALL remaining `loading: true` mock returns in tests with skeleton rendering
- [x] 9.3b i18n infrastructure: Install next-intl, create messages/es.json, configure routing, update middleware, demo component with translations
- [x] 9.4 Write E2E tests (Playwright): login → dashboard → top-up → transfer → QR pay → bill pay → notifications → KYC → 2FA → logout
- [x] 9.5 Performance audit: Lighthouse > 90, bundle analysis (< 200KB gzip), `next/image` optimization, font subsetting
- [x] 9.6 Configure Vercel: staging + production domains, GitHub Actions CI (lint → test → build → deploy), preview deploys for PRs
- [x] 9.7 Security hardening: CSP headers via `next.config.js`, rate limiting on API proxy routes, input sanitization audit

---

## Summary Table

| Phase | Tasks | Focus |
|-------|-------|-------|
| Phase 0: Foundation | 9 | Project setup, tooling, auth provider, layout |
| Phase 1: Auth | 7 | Login, register, password reset, 2FA input, middleware |
| Phase 2: Core Wallet | 8 | Dashboard, wallet CRUD, balance, transactions |
| Phase 3: TopUps | 5 | Card, PSE, cash flows, top-up history |
| Phase 4: P2P Transfers | 5 | Send money, recipient search, confirmation, history |
| Phase 5: QR Payments | 5 | Generate, display, scan, pay, history |
| Phase 6: Bill Payments | 6 | Biller search, payment, favorites, history |
| Phase 7: Notifications | 5 | Real-time (Ably), inbox, toast, preferences |
| Phase 8: Security & KYC | 6 | 2FA, devices, KYC documents, status |
| Phase 9: Polish & Deploy | 6 | Error boundaries, skeletons, E2E, Vercel, security |
| **Total** | **62** | |

## Implementation Order

1. **Phase 0 → Phase 1**: Foundation must exist before any feature. Auth is critical path — all other features depend on it.
2. **Phase 2**: Core wallet is the hub — top-ups, transfers, QR, bills all modify wallet balance.
3. **Phase 3-6**: Feature modules are independent of each other, can be parallelized. Order by business priority: TopUps (revenue) → P2P → QR → Bills.
4. **Phase 7**: Notifications depend on Ably setup but can be built alongside features (subscribe to events as they're created).
5. **Phase 8**: Security/KYC can be built in parallel with features but should be tested end-to-end last.
6. **Phase 9**: Polish happens iteratively but final deployment tasks are last.

## Dependencies Graph

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──┬──▶ Phase 3 (TopUps)
                                    ├──▶ Phase 4 (P2P)
                                    ├──▶ Phase 5 (QR)
                                    ├──▶ Phase 6 (Bills)
                                    └──▶ Phase 7 (Notifications)
Phase 0 ──▶ Phase 8 (Security/KYC) ──▶ Phase 9 (Polish/Deploy)
```

## Next Step

Ready for implementation (sdd-apply).
