# Virtual Wallet Frontend — Specifications

## Overview

Frontend specifications for Ledger Engine Virtual Wallet. Next.js 14 (App Router) consuming 25+ REST endpoints via OpenAPI-generated client. LATAM fintech (COP, PSE, Keycloak). Focus: USER EXPERIENCE, not API wrapping.

---

## Capability: auth

### User Stories

1. **US-AUTH-01**: As a user, I want to log in with email/password via Keycloak so that I access my wallet securely.
2. **US-AUTH-02**: As a new user, I want to register with email and phone so that I create a wallet account.
3. **US-AUTH-03**: As a user, I want to reset my password via email so that I regain access.
4. **US-AUTH-04**: As a user, I want to verify my email and phone so that my account is fully activated.
5. **US-AUTH-05**: As a user, I want tokens to refresh automatically so that I stay logged in without interruption.

### Scenarios

```gherkin
Feature: Authentication

  Scenario: Successful login
    Given a registered user with email "user@test.com"
    When the user submits valid credentials
    Then JWT tokens (access + refresh) are stored in httpOnly cookies
    And the user is redirected to /dashboard
    And the user menu shows their name

  Scenario: Login with invalid credentials
    Given an unregistered email "wrong@test.com"
    When the user submits invalid credentials
    Then an error toast shows "Credenciales incorrectas"
    And the form remains filled (no data loss)
    And the login button is re-enabled

  Scenario: Registration flow
    Given a new user on /register
    When the user submits email, phone (E.164), name, password
    Then a verification email is sent
    And the user sees "Verifica tu correo electrónico"
    And upon email verification, KYC prompt appears

  Scenario: Password reset
    Given a user on /forgot-password
    When the user submits their email
    Then a success message always shows (prevents enumeration)
    And the user checks email for reset link

  Scenario: Token refresh
    Given an authenticated user with expiring access token
    When the token is within 2 minutes of expiry
    Then the refresh token is used automatically
    And a new access token is issued
    And the user experiences no interruption

  Scenario: Session expired
    Given a user with an expired refresh token
    When the user makes an API call
    Then the user is redirected to /login
    And a toast says "Tu sesión ha expirado. Inicia sesión de nuevo."
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-AUTH-01 | Login completes in < 3s (Keycloak round-trip) | Yes |
| AC-AUTH-02 | Tokens stored in httpOnly secure cookies, NOT localStorage | Yes |
| AC-AUTH-03 | Refresh happens automatically 2min before expiry | Yes |
| AC-AUTH-04 | Registration requires: email, phone (E.164 +57), name, password (min 8) | Yes |
| AC-AUTH-05 | Forgot-password always returns success (no enumeration) | Yes |
| AC-AUTH-06 | Auth state persisted across page refreshes | Yes |
| AC-AUTH-07 | Logout clears cookies + redirects to Keycloak logout | Yes |

### API Contracts

```
POST /api/v1/auth/register
  Request: { email, phone, firstName, lastName, password }
  Response 201: { userId, email, phone, status: "PENDING_VERIFICATION" }

POST /api/v1/auth/login
  Request: { email, password }
  Response 200: { accessToken, refreshToken, expiresIn, requires2FA? }

POST /api/v1/auth/refresh
  Request: { refreshToken }
  Response 200: { accessToken, refreshToken (rotated) }

POST /api/v1/auth/forgot-password
  Request: { email }
  Response 200: { message: "Si el email existe, recibirás un enlace" }

POST /api/v1/auth/verify-email
  Request: { token }
  Response 200: { verified: true }

POST /api/v1/auth/verify-phone
  Request: { phone, otp }
  Response 200: { verified: true }
```

### UI Components

- `LoginPage` — Email/password form, "¿Olvidaste tu contraseña?" link, "Crear cuenta" link
- `RegisterPage` — Multi-field form with phone input (E.164), password strength indicator
- `ForgotPasswordPage` — Single email input, success confirmation
- `VerifyEmailPage` — Auto-verify on load, success/error state
- `VerifyPhonePage` — OTP input (6 digits), resend timer (60s)
- `AuthProvider` — KeycloakProvider wrapper, token management
- `UserMenu` — Avatar, name, settings link, logout

### State Management

- **TanStack Query**: Auth mutations (login, register, refresh)
- **Keycloak SDK**: Token state, authentication status
- **No global auth store**: Keycloak SDK IS the auth state

### Edge Cases

- **Keycloak down**: Show maintenance page with retry button
- **CORS error**: Detect and show "Error de configuración. Contacta soporte."
- **Network offline**: Queue login attempt, retry on reconnect
- **Concurrent tabs**: Token refresh coordinated across tabs via BroadcastChannel

---

## Capability: wallets

### User Stories

1. **US-WAL-01**: As a user, I want to see all my wallets on a dashboard so that I have an overview of my finances.
2. **US-WAL-02**: As a user, I want to see my balance in real-time so that I know available funds.
3. **US-WAL-03**: As a user, I want to create an additional wallet so that I can organize money by purpose.
4. **US-WAL-04**: As a user, I want to rename a wallet so that I identify it easily.
5. **US-WAL-05**: As a user, I want to deactivate a wallet so that I stop using it.
6. **US-WAL-06**: As a user, I want to see transaction history per wallet so that I track spending.

### Scenarios

```gherkin
Feature: Wallet Dashboard

  Scenario: Dashboard loads with wallets
    Given an authenticated user with 2 wallets
    When the user navigates to /dashboard
    Then both wallets are displayed with name, balance, and currency
    And the total balance is shown at the top
    And a skeleton loader appears while fetching

  Scenario: Real-time balance update
    Given a user viewing wallet "Mi Ahorro" with balance 500,000 COP
    When a P2P transfer of 50,000 COP is received
    Then the balance updates to 550,000 COP without page refresh
    And a subtle animation highlights the change

  Scenario: Empty state — no wallets
    Given a newly registered user with KYC approved but no wallets
    When the dashboard loads
    Then a friendly empty state is shown
    And a "Crear mi primera billetera" CTA is prominent

  Scenario: Create additional wallet
    Given a user on /dashboard
    When the user clicks "Nueva billetera" and enters name "Viajes"
    Then a new wallet is created
    And it appears in the wallet list
    And a success toast confirms creation

  Scenario: Deactivate wallet
    Given a user with wallet "Inactivo" containing 0 COP
    When the user clicks deactivate and confirms
    Then the wallet status changes to INACTIVE
    And it is hidden from the main list
    And a confirmation toast appears

  Scenario: Wallet detail with history
    Given a user clicks on wallet "Mi Ahorro"
    When the detail page loads
    Then the balance is prominently displayed
    And the last 20 transactions are shown
    And pagination loads more on scroll
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-WAL-01 | Dashboard loads in < 500ms (skeleton immediately) | Yes |
| AC-WAL-02 | Balance format: "$ 1.234.567" (COP locale) | Yes |
| AC-WAL-03 | Balance updates in real-time via WebSocket/polling | Yes |
| AC-WAL-04 | Max 5 wallets per user | Yes |
| AC-WAL-05 | Wallet with balance cannot be deactivated | Yes |
| AC-WAL-06 | Transaction history paginated (20 per page) | Yes |
| AC-WAL-07 | Total balance sums all active wallets | Yes |

### API Contracts

```
GET /api/v1/wallets
  Response 200: { wallets: [{ walletId, name, currency, status, createdAt }] }

GET /api/v1/wallets/{walletId}
  Response 200: { walletId, name, currency, status, createdAt, balance? }

GET /api/v1/wallets/{walletId}/balance
  Response 200: { available, pending, currency, lastUpdated }

POST /api/v1/wallets
  Request: { name, currency: "COP" }
  Response 201: { walletId, name, currency, status: "ACTIVE" }

PATCH /api/v1/wallets/{walletId}
  Request: { name: "Nuevo nombre" }
  Response 200: { walletId, name }

POST /api/v1/wallets/{walletId}/deactivate
  Response 200: { status: "INACTIVE" }
  Errors: 422 (WALLET_HAS_BALANCE)
```

### UI Components

- `DashboardPage` — Total balance, wallet grid, recent activity
- `WalletCard` — Name, balance (animated), status badge, click-to-detail
- `WalletList` — Grid of WalletCards, "Nueva billetera" button
- `WalletDetailPage` — Balance hero, transaction list, actions menu
- `BalanceDisplay` — COP formatted, animated number, pending indicator
- `CreateWalletDialog` — Name input, confirmation
- `TransactionHistory` — Paginated table, date grouping, type icons

### State Management

- **TanStack Query**: `useWallets`, `useWallet`, `useBalance` with 30s stale time
- **Optimistic updates**: Wallet rename updates UI immediately
- **Query invalidation**: Balance refetch on WebSocket notification

### Edge Cases

- **Balance fetch slow**: Show last-known balance with "Actualizando..." indicator
- **Wallet creation fails (limit reached)**: Show "Máximo 5 billeteras" with upgrade prompt
- **Deactivate with balance**: Block action, show "Transfiere el saldo primero"
- **Currency mismatch**: All wallets COP — no conversion needed for MVP

---

## Capability: topups

### User Stories

1. **US-TOP-01**: As a user, I want to top up my wallet with a credit/debit card so that I add funds instantly.
2. **US-TOP-02**: As a user, I want to top up via PSE (bank transfer) so that I use my bank account.
3. **US-TOP-03**: As a user, I want to top up with cash (reference number) so that I pay at a physical location.
4. **US-TOP-04**: As a user, I want to see my top-up history so that I track deposits.
5. **US-TOP-05**: As a user, I want to confirm a cash top-up after paying so that the funds are credited.

### Scenarios

```gherkin
Feature: Wallet Top-Up

  Scenario: Card top-up success
    Given a user with wallet "Mi Ahorro"
    When the user selects "Tarjeta", enters amount 100,000 COP and card details
    Then the payment is processed synchronously
    And the balance increases by 100,000 COP
    And a DEPOSIT transaction appears in history
    And a success toast shows "Recarga exitosa"

  Scenario: PSE redirect flow
    Given a user selects "PSE" and enters amount 200,000 COP
    When the user selects their bank
    Then the user is redirected to the bank's PSE page
    And upon successful payment, the user is redirected back
    And a "Processing" state is shown while awaiting confirmation
    And the balance updates once confirmed

  Scenario: Cash top-up reference
    Given a user selects "Efectivo" and enters amount 50,000 COP
    When the request is submitted
    Then a reference number is generated (e.g., "REF-12345678")
    And instructions are shown: "Paga en cualquier punto Baloto/Efecty"
    And the reference expires in 24 hours

  Scenario: Confirm cash top-up
    Given a user with pending cash top-up "REF-12345678"
    When the user clicks "Confirmar pago" after paying
    Then the top-up status changes to COMPLETED
    And the wallet balance increases
    And the reference is marked as used

  Scenario: Top-up failed
    Given a user attempting a card top-up
    When the card is declined
    Then an error message shows "Pago rechazado. Verifica tus datos."
    And the form remains filled for retry
    And NO balance change occurs

  Scenario: Top-up history
    Given a user with 15 past top-ups
    When the user views top-up history
    Then transactions are paginated (10 per page)
    And each shows: date, amount, method, status
    And filters by method and date range are available
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-TOP-01 | Card top-up completes in < 5s | Yes |
| AC-TOP-02 | PSE redirect flow handles success AND cancellation | Yes |
| AC-TOP-03 | Cash reference expires in 24h | Yes |
| AC-TOP-04 | Failed top-up shows specific error (card declined, insufficient, etc.) | Yes |
| AC-TOP-05 | Top-up history paginated with method/status filters | Yes |
| AC-TOP-06 | Amount input validates: min 1,000 COP, max 10,000,000 COP | Yes |
| AC-TOP-07 | Balance updates optimistically after confirmed top-up | Yes |

### API Contracts

```
POST /api/v1/wallets/{walletId}/topup
  Request: { amount, method: "CARD"|"PSE", cardToken?, bankCode? }
  Response 200 (sync): { topUpId, amount, status: "COMPLETED" }
  Response 202 (async PSE): { topUpId, redirectUrl, status: "PENDING" }

POST /api/v1/wallets/{walletId}/topup/cash
  Request: { amount }
  Response 201: { topUpId, referenceNumber, expiresAt, status: "PENDING" }

POST /api/v1/topups/{topUpId}/confirm
  Response 200: { status: "COMPLETED" }
  Errors: 404 (REFERENCE_EXPIRED), 422 (ALREADY_CONFIRMED)

GET /api/v1/wallets/{walletId}/topups
  Query: page, size, method, status, dateFrom, dateTo
  Response 200: { content: [...], pagination }
```

### UI Components

- `TopUpPage` — Method selector (cards: Tarjeta, PSE, Efectivo), amount input
- `CardTopUpForm` — Card number, expiry, CVV, amount, submit button
- `PSEBankSelector` — Bank list with search, amount input
- `CashTopUpResult` — Reference number (copyable), instructions, expiry countdown
- `TopUpConfirmButton` — "Ya pagué" action for cash references
- `TopUpHistory` — Table with status badges, method icons, date formatting
- `TopUpStatusBadge` — COMPLETED (green), PENDING (yellow), FAILED (red)

### State Management

- **TanStack Query**: Top-up mutations with `onSuccess` invalidation of wallet balance
- **Polling**: PSE redirect uses 5s polling until status confirmed
- **Optimistic**: Balance updates immediately on card top-up success

### Edge Cases

- **PSE bank selection fails**: Show "Banco no disponible. Intenta otro."
- **Cash reference expired**: Show "Referencia vencida. Genera una nueva."
- **Duplicate top-up attempt**: Idempotency key prevents double charge
- **Network timeout on card**: Retry with same idempotency key
- **Browser back during PSE**: Detect incomplete state, show resume option

---

## Capability: p2p-transfers

### User Stories

1. **US-P2P-01**: As a user, I want to send money by email so that I transfer without knowing the recipient's account.
2. **US-P2P-02**: As a user, I want to send money by phone number so that I transfer to contacts.
3. **US-P2P-03**: As a user, I want to add a note to transfers so that the recipient knows the purpose.
4. **US-P2P-04**: As a user, I want to confirm before sending so that I avoid mistakes.
5. **US-P2P-05**: As a user, I want to see my transfer history so that I track sent/received money.
6. **US-P2P-06**: As a recipient, I want to receive a real-time notification so that I know money arrived.

### Scenarios

```gherkin
Feature: P2P Transfers

  Scenario: Send money by email
    Given a user with wallet balance 500,000 COP
    When the user enters recipient "friend@email.com" and amount 50,000 COP
    Then the recipient is searched and shown as "Carlos M."
    And a confirmation dialog shows: recipient, amount, note, source wallet
    And upon confirmation, 50,000 COP is deducted
    And the recipient receives a real-time notification

  Scenario: Send money by phone
    Given a user with wallet balance 300,000 COP
    When the user enters phone "+573001234567" and amount 25,000 COP
    Then the recipient is resolved and displayed
    And the transfer proceeds with confirmation

  Scenario: Insufficient funds
    Given a user with wallet balance 10,000 COP
    When the user tries to send 50,000 COP
    Then an error shows "Saldo insuficiente. Disponible: $ 10.000"
    And the transfer is blocked

  Scenario: Recipient not found
    When the user enters "unknown@email.com"
    Then a message shows "No se encontró usuario con este email"
    And the user can correct the input

  Scenario: Transfer history
    Given a user with 20 past transfers
    When the user views transfer history
    Then transfers show: date, recipient (masked), amount, status, note
    And sent/received tabs are available
    And pagination loads more on scroll

  Scenario: Duplicate transfer prevention
    Given a user who just sent 50,000 COP to "friend@email.com"
    When the user tries to send the same amount to the same person within 10s
    Then a warning shows "¿Enviar otra vez? Parece un duplicado."
    And the user must explicitly confirm
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-P2P-01 | Transfer completes in < 3s | Yes |
| AC-P2P-02 | Recipient resolved by email OR phone (E.164) | Yes |
| AC-P2P-03 | Confirmation step is REQUIRED before sending | Yes |
| AC-P2P-04 | Balance deducts atomically on success | Yes |
| AC-P2P-05 | Notification delivered to recipient in < 1s | Yes |
| AC-P2P-06 | Transfer note max 140 characters | Yes |
| AC-P2P-07 | History paginated with sent/received tabs | Yes |

### API Contracts

```
POST /api/v1/p2p/transfers
  Request: { recipientEmail?, recipientPhone?, amount, note?, sourceWalletId }
  Response 201: { transferId, recipientName (masked), amount, status, createdAt }
  Errors: 404 (RECIPIENT_NOT_FOUND), 422 (INSUFFICIENT_FUNDS), 422 (SELF_TRANSFER)

GET /api/v1/p2p/transfers
  Query: page, size, type (SENT|RECEIVED), dateFrom, dateTo
  Response 200: { content: [...], pagination }

GET /api/v1/p2p/transfers/{transferId}
  Response 200: { transferId, sender, recipient, amount, note, status, createdAt }
```

### UI Components

- `TransferPage` — Recipient input with live search, amount input, source wallet selector
- `RecipientSearch` — Input with debounce (300ms), shows resolved user with avatar
- `TransferConfirmationDialog` — Summary: recipient, amount, fee (if any), note, "Confirmar" button
- `TransferForm` — Amount (COP formatted), note textarea, "Enviar" button
- `TransferHistory` — Tabs (Enviados/Recibidos), table, status badges
- `TransferStatusBadge` — COMPLETED, PENDING, FAILED with colors
- `TransferDetailSheet` — Slide-over with full transfer details

### State Management

- **TanStack Query**: Transfer mutations, history queries
- **Optimistic updates**: Deduct balance immediately, rollback on error
- **Recipient cache**: Debounced search results cached for 5 minutes

### Edge Cases

- **Self-transfer attempt**: Block with "No puedes enviarte dinero a ti mismo"
- **Recipient exists but wallet inactive**: Show "El destinatario no tiene billetera activa"
- **Concurrent transfers**: Optimistic deduction prevents double-spend
- **Transfer to self email**: Detect and block before confirmation
- **Keyboard shortcut**: Enter key submits form only after validation passes

---

## Capability: qr-payments

### User Stories

1. **US-QR-01**: As a user, I want to generate a QR code with a fixed amount so that others can scan and pay me.
2. **US-QR-02**: As a user, I want to generate a dynamic QR so that the payer enters the amount.
3. **US-QR-03**: As a user, I want to scan a QR code and pay so that I transfer money quickly.
4. **US-QR-04**: As a user, I want to share a QR code so that others can pay me remotely.
5. **US-QR-05**: As a user, I want to see QR payment history so that I track QR transactions.

### Scenarios

```gherkin
Feature: QR Payments

  Scenario: Generate fixed amount QR
    Given a user on /qr/generate
    When the user enters amount 25,000 COP and clicks "Generar"
    Then a QR code is displayed with the amount embedded
    And the user can download or share the QR image
    And the QR is valid for 15 minutes

  Scenario: Generate dynamic QR
    Given a user on /qr/generate
    When the user selects "Monto dinámico" (no amount)
    Then a QR code is generated without amount
    And the scanner will prompt for amount

  Scenario: Scan and pay QR
    Given a user on /qr/pay
    When the user scans a valid QR code
    Then the payment details are shown: recipient, amount (if fixed)
    And the user confirms and pays
    And the balance is deducted
    And the recipient is notified in real-time

  Scenario: Scan dynamic QR
    Given a dynamic QR with no amount
    When the user scans it
    Then the user is prompted to enter the amount
    And the amount is validated (min/max limits)
    And the user confirms the payment

  Scenario: Expired QR code
    Given a QR generated 16 minutes ago
    When another user tries to scan it
    Then an error shows "Código QR expirado. Solicita uno nuevo."
    And no payment is processed

  Scenario: QR payment history
    Given a user with 10 QR payments
    When the user views QR history
    Then payments show: date, type (sent/received), amount, counterparty
    And filters by type and date are available
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-QR-01 | QR generated in < 2s | Yes |
| AC-QR-02 | QR valid for 15 minutes (configurable) | Yes |
| AC-QR-03 | QR supports download (PNG) and native share | Yes |
| AC-QR-04 | Camera permission requested gracefully | Yes |
| AC-QR-05 | Payment < 3s for fixed amount QR | Yes |
| AC-QR-06 | Dynamic QR requires manual amount entry | Yes |

### API Contracts

```
POST /api/v1/qr/generate
  Request: { amount?, walletId, expiresInMinutes?: 15 }
  Response 201: { qrId, qrData (base64), qrUrl, expiresAt }

POST /api/v1/qr/pay
  Request: { qrData, amount?, walletId }
  Response 201: { paymentId, amount, recipient, status: "COMPLETED" }
  Errors: 404 (QR_EXPIRED), 422 (INSUFFICIENT_FUNDS), 422 (AMOUNT_REQUIRED)

GET /api/v1/qr/payments
  Query: page, size, type (SENT|RECEIVED), dateFrom, dateTo
  Response 200: { content: [...], pagination }
```

### UI Components

- `QRGeneratePage` — Amount input (optional), wallet selector, "Generar QR" button
- `QRDisplay` — QR code image, countdown timer, download button, share button
- `QRPayPage` — Camera viewfinder, "Escanear" button, manual entry fallback
- `QRPaymentConfirm` — Recipient, amount, "Pagar" button
- `QRPaymentHistory` — Table with type badges, amounts, dates
- `QRScanner` — Camera component with permission handling

### State Management

- **TanStack Query**: QR generation, payment mutations, history
- **Local state**: Camera permission status, scan result
- **Timer**: QR expiration countdown (client-side)

### Edge Cases

- **Camera permission denied**: Show "Permiso de cámara requerido" with instructions to enable
- **No camera available**: Show "Escanea el código desde tu galería" with file upload
- **QR amount mismatch**: Dynamic QR — user enters amount; fixed QR — amount is locked
- **Concurrent QR scan**: Only first scan processes, second shows "Pago ya procesado"
- **Share API not available**: Fallback to download only

---

## Capability: bill-payments

### User Stories

1. **US-BILL-01**: As a user, I want to pay utility bills (electricity, water, gas) from my wallet.
2. **US-BILL-02**: As a user, I want to save favorite billers so that I pay quickly next time.
3. **US-BILL-03**: As a user, I want to see bill payment history so that I track what I've paid.
4. **US-BILL-04**: As a user, I want to search billers so that I find the right one fast.

### Scenarios

```gherkin
Feature: Bill Payments

  Scenario: Pay utility bill
    Given a user with wallet balance 500,000 COP
    When the user selects biller "EMCALI", enters reference "123456789" and amount 150,000 COP
    Then a confirmation dialog shows biller, reference, amount
    And upon confirmation, 150,000 COP is deducted
    And a bill payment is sent to the provider
    And the status shows "Procesando"

  Scenario: Bill payment confirmed
    Given a pending bill payment
    When the provider confirms
    Then the status changes to "Completado"
    And a notification is sent to the user
    And the balance does NOT change (already deducted)

  Scenario: Bill payment rejected
    Given a pending bill payment
    When the provider rejects with "REFERENCIA_INVÁLIDA"
    Then the status changes to "Fallido"
    And the wallet is refunded automatically
    And the error reason is shown to the user

  Scenario: Save favorite biller
    Given a user who just paid EMCALI
    When the user clicks "Guardar como favorito"
    Then the biller is saved with alias "EMCALI Casa"
    And it appears in the favorites list

  Scenario: Pay from favorites
    Given a user with 3 favorite billers
    When the user clicks on "EMCALI Casa"
    Then the biller code and last reference are pre-filled
    And the user only needs to enter the new amount

  Scenario: Biller not found
    When the user searches "XYZNOTEXIST"
    Then a message shows "No se encontró el facturador"
    And popular billers are suggested
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-BILL-01 | Bill payment completes in < 5s (async provider) | Yes |
| AC-BILL-02 | Failed payments auto-refund within 30s | Yes |
| AC-BILL-03 | Max 10 favorite billers per user | Yes |
| AC-BILL-04 | Biller search filters by name/code | Yes |
| AC-BILL-05 | Supported billers: EMCALI, VARIANDES, GAS_NATURAL, ETB, CLARO | Yes |
| AC-BILL-06 | History paginated with biller/status filters | Yes |

### API Contracts

```
POST /api/v1/bills/pay
  Request: { billerCode, referenceNumber, amount, sourceWalletId? }
  Response 202: { billPaymentId, billerCode, referenceNumber, amount, status: "PROCESSING" }
  Errors: 422 (INSUFFICIENT_FUNDS), 422 (INVALID_REFERENCE)

GET /api/v1/bills/payments
  Query: page, size, billerCode, status, dateFrom, dateTo
  Response 200: { content: [...], pagination }

GET /api/v1/bills/favorites
  Response 200: { favorites: [{ favoriteId, billerCode, billerName, referenceNumber, alias }] }

POST /api/v1/bills/favorites
  Request: { billerCode, referenceNumber, alias? }
  Response 201: { favorite object }
  Errors: 400 (FAVORITES_LIMIT_EXCEEDED)
```

### UI Components

- `BillPaymentPage` — Biller search, favorites quick-access, payment form
- `BillerSearch` — Searchable select with categories (Energía, Agua, Gas, Telecom)
- `BillPaymentForm` — Reference number input, amount input, wallet selector
- `BillConfirmationDialog` — Summary: biller, reference, amount, "Pagar" button
- `BillFavoritesList` — Grid of favorite cards, add/remove actions
- `BillPaymentHistory` — Table with status badges, biller icons, amounts
- `BillStatusBadge` — PROCESSING (blue), COMPLETED (green), FAILED (red)

### State Management

- **TanStack Query**: Favorites CRUD, payment mutations, history
- **Optimistic**: Balance deducts immediately, refunds on failure
- **Polling**: Bill payment status polled every 5s until terminal state

### Edge Cases

- **Reference number validation**: Only numeric, min 6, max 20 chars
- **Favorite limit reached**: Show "Máximo 10 favoritos. Elimina uno para agregar otro."
- **Provider timeout**: Show "El proveedor no responde. Intenta más tarde."
- **Duplicate payment**: Idempotency key prevents paying same reference twice
- **Amount exceeds limit**: Show "Monto máximo $8.000.000 para este servicio"

---

## Capability: notifications

### User Stories

1. **US-NOT-01**: As a user, I want to see a notification inbox so that I review past notifications.
2. **US-NOT-02**: As a user, I want to receive real-time notifications so that I'm informed immediately.
3. **US-NOT-03**: As a user, I want to manage notification preferences so that I control what I receive.
4. **US-NOT-04**: As a user, I want to see an unread badge so that I know there are new notifications.
5. **US-NOT-05**: As a user, I want to mark notifications as read so that I track what I've seen.

### Scenarios

```gherkin
Feature: Notifications

  Scenario: Real-time notification received
    Given a user with an active WebSocket connection
    When a P2P transfer is received
    Then a toast notification appears within 1s
    And the notification bell badge increments
    And the notification appears in the inbox

  Scenario: Notification when offline
    Given a user with no active connection
    When a transfer is received
    Then the notification is stored server-side
    And when the user reconnects, pending notifications are delivered
    And the badge shows the correct unread count

  Scenario: Mark as read
    Given a user with 5 unread notifications
    When the user clicks on notification "notif-123"
    Then the notification is marked as read
    And the unread count decrements

  Scenario: Mark all as read
    Given a user with 10 unread notifications
    When the user clicks "Marcar todo como leído"
    Then all notifications are marked as read
    And the badge shows 0

  Scenario: Notification preferences
    Given a user with push enabled and email disabled
    When a top-up completes
    Then a push notification is sent
    And no email notification is sent

  Scenario: Security alert cannot be disabled
    Given a user on preferences page
    When the user tries to disable SECURITY_ALERT push
    Then the toggle is disabled with tooltip "Las alertas de seguridad no se pueden desactivar"
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-NOT-01 | Real-time delivery via WebSocket < 1s | Yes |
| AC-NOT-02 | Offline notifications replayed on reconnect | Yes |
| AC-NOT-03 | Badge count accurate across tabs | Yes |
| AC-NOT-04 | Inbox paginated (50 per page) | Yes |
| AC-NOT-05 | SECURITY_ALERT cannot be disabled | Yes |
| AC-NOT-06 | Notifications older than 90 days archived | Yes |
| AC-NOT-07 | Push notification body masks PII (email/phone) | Yes |

### API Contracts

```
WebSocket: /ws/notifications
  Headers: Authorization: Bearer {token}
  Messages: { notificationId, type, title, body, data, createdAt }

GET /api/v1/notifications
  Query: page, size, unreadOnly
  Response 200: { content: [...], unreadCount, pagination }

POST /api/v1/notifications/{notificationId}/read
  Response 200: { isRead: true }

POST /api/v1/notifications/read-all
  Response 200: { markedCount }

GET /api/v1/notifications/preferences
  Response 200: { preferences: [{ type, push, email, sms }] }

PUT /api/v1/notifications/preferences
  Request: { preferences: [{ type, push, email, sms }] }
  Response 200: { updated preferences }
```

### UI Components

- `NotificationBell` — Bell icon + unread count badge, dropdown preview
- `NotificationList` — Full inbox page, paginated, "Marcar todo leído"
- `NotificationItem` — Icon by type, title, body, timestamp, read/unread state
- `NotificationPreferencesPage` — Toggle grid: type × channel (push/email/sms)
- `NotificationToast` — Real-time popup with auto-dismiss (5s), click to navigate

### State Management

- **TanStack Query**: Inbox queries with `refetchOnWindowFocus`
- **WebSocket/Ably**: Real-time notification channel per user
- **Optimistic**: Badge decrements on mark-read, rollback on error
- **Cross-tab sync**: BroadcastChannel for badge count

### Edge Cases

- **WebSocket reconnect**: Exponential backoff (1s, 2s, 4s, max 30s)
- **Notification flood (> 10 in 1s)**: Batch into single toast "3 nuevas notificaciones"
- **Browser notification permission**: Request on first real-time notification
- **Inbox full (100 items)**: Auto-archive oldest, show "Notificaciones antiguas en archivo"
- **Notification type mapping**: Map backend types to icons (💰 P2P, 🔔 TopUp, 🔒 Security)

---

## Capability: security

### User Stories

1. **US-SEC-01**: As a user, I want to enable 2FA (TOTP) so that my account is more secure.
2. **US-SEC-02**: As a user, I want to disable 2FA so that I remove the extra step if I no longer need it.
3. **US-SEC-03**: As a user, I want to see my trusted devices so that I know where I'm logged in.
4. **US-SEC-04**: As a user, I want to revoke a device so that unauthorized access is blocked.
5. **US-SEC-05**: As a user, I want to see backup codes so that I can recover my account.

### Scenarios

```gherkin
Feature: Two-Factor Authentication

  Scenario: Enable 2FA
    Given an authenticated user on /settings/security
    When the user clicks "Habilitar 2FA"
    Then a TOTP QR code is displayed
    And the user scans it with an authenticator app
    And enters a 6-digit verification code
    And upon success, 10 backup codes are shown
    And 2FA is now required on next login

  Scenario: Login with 2FA
    Given a user with 2FA enabled
    When the user logs in with correct credentials
    Then the login response includes "requires2FA: true"
    And the user is prompted for a TOTP code
    And upon success, a JWT is issued

  Scenario: Invalid 2FA code
    Given a user entering a TOTP code
    When the code is invalid
    Then an error shows "Código incorrecto. Intentos restantes: 4"
    And after 5 failed attempts, the account is locked for 30 minutes
    And a SECURITY_ALERT notification is sent

  Scenario: Disable 2FA
    Given a user with 2FA enabled
    When the user enters current TOTP code and clicks "Deshabilitar"
    Then 2FA is disabled
    And next login will not require TOTP

Feature: Device Management

  Scenario: View trusted devices
    Given a user on /settings/security
    When the devices section loads
    Then a list of devices shows: name, OS, browser, last login, isCurrent
    And the current device is highlighted

  Scenario: Revoke device
    Given a user with 3 trusted devices
    When the user revokes "iPhone 15 Pro"
    Then the device is removed from the list
    And future logins from that device require 2FA
    And a SECURITY_ALERT notification is sent
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-SEC-01 | 2FA setup shows QR code and provisioning URI | Yes |
| AC-SEC-02 | Backup codes shown once, copyable, downloadable | Yes |
| AC-SEC-03 | Account locked after 5 failed 2FA attempts (30 min) | Yes |
| AC-SEC-04 | Device trust expires after 30 days of inactivity | Yes |
| AC-SEC-05 | Revoke requires confirmation dialog | Yes |
| AC-SEC-06 | Current device always shown in device list | Yes |

### API Contracts

```
POST /api/v1/security/2fa/enable
  Response 200: { secret, provisioningUri, qrCodeUrl }

POST /api/v1/security/2fa/verify
  Request: { code }
  Response 200: { enabled: true, backupCodes: [...] }
  Errors: 400 (INVALID_CODE)

POST /api/v1/security/2fa/disable
  Request: { code }
  Response 200: { enabled: false }

GET /api/v1/security/devices
  Response 200: { devices: [{ deviceId, name, os, browser, lastLoginAt, isCurrentDevice, trusted }] }

DELETE /api/v1/security/devices/{deviceId}
  Response 200: { revoked: true }
```

### UI Components

- `SecuritySettingsPage` — 2FA section, device list, security log
- `TwoFactorSetup` — QR code display, TOTP input, backup codes table
- `TwoFactorVerifyInput` — 6-digit code input with auto-submit
- `BackupCodesDisplay` — Table of codes, "Copiar todos" button, "Descargar" button
- `DeviceList` — Cards with device info, current badge, revoke button
- `DeviceRevokeDialog` — Confirmation: "¿Revocar iPhone 15 Pro?"
- `AccountLockedBanner` — "Cuenta bloqueada por 30 minutos" with countdown

### State Management

- **TanStack Query**: 2FA mutations, device list queries
- **Local state**: QR code URL, backup codes (shown once)
- **Timer**: Lockout countdown, device expiry

### Edge Cases

- **QR code fails to load**: Show provisioning URI as fallback with copy button
- **Backup codes lost**: Show "Si perdiste tus códigos, deshabilita y vuelve a habilitar 2FA"
- **Revoke current device**: Force re-login on current session
- **2FA required mid-session**: If backend requires step-up, show modal with TOTP input
- **Browser doesn't support WebCrypto**: Show manual key entry instead of QR

---

## Capability: kyc

### User Stories

1. **US-KYC-01**: As a user, I want to submit identity documents so that I verify my identity.
2. **US-KYC-02**: As a user, I want to see my KYC status so that I know if verification is complete.
3. **US-KYC-03**: As a user, I want to know why KYC was rejected so that I can fix and resubmit.

### Scenarios

```gherkin
Feature: KYC Verification

  Scenario: Submit KYC documents
    Given a user on /settings/kyc
    When the user uploads front ID photo, back ID photo, and selfie
    Then the documents are uploaded (with progress indicator)
    And the KYC status changes to "UNDER_REVIEW"
    And a message says "Verificación en proceso. Te notificaremos."

  Scenario: KYC approved
    Given a user with KYC status "UNDER_REVIEW"
    When the review is approved
    Then a notification is sent
    And a wallet is auto-created (PRIMARY, COP, ACTIVE)
    And the user is redirected to dashboard

  Scenario: KYC rejected
    Given a user with KYC status "UNDER_REVIEW"
    When the review is rejected with reason "DOCUMENT_BLURRY"
    Then a notification explains the rejection
    And the user can resubmit with new documents

  Scenario: Already verified
    Given a user with KYC status "APPROVED"
    When the user visits /settings/kyc
    Then a success state is shown: "Tu identidad está verificada ✓"
    And the submit form is hidden

  Scenario: Document upload fails
    Given a user uploading a document
    When the file exceeds 5MB or is not JPG/PNG
    Then an error shows "Archivo no válido. Máximo 5MB, formatos JPG/PNG."
    And the upload is blocked
```

### Acceptance Criteria

| ID | Criterion | Testable |
|----|-----------|----------|
| AC-KYC-01 | Supported formats: JPG, PNG, max 5MB each | Yes |
| AC-KYC-02 | Upload shows progress indicator | Yes |
| AC-KYC-03 | KYC status displayed: PENDING, UNDER_REVIEW, APPROVED, REJECTED | Yes |
| AC-KYC-04 | Auto-wallet creation on approval | Yes |
| AC-KYC-05 | Rejection reason shown to user | Yes |
| AC-KYC-06 | Resubmission allowed after rejection | Yes |

### API Contracts

```
POST /api/v1/kyc/submit
  Request: FormData { documentFront: File, documentBack: File, selfie: File }
  Response 201: { kycId, status: "UNDER_REVIEW", submittedAt }

GET /api/v1/kyc/status
  Response 200: { status, rejectionReason?, submittedAt, reviewedAt? }
```

### UI Components

- `KYCPage` — Status display, document upload form, resubmit option
- `DocumentUpload` — Drag-and-drop zone, file preview, progress bar
- `KYCStatusBadge` — PENDING (gray), UNDER_REVIEW (blue), APPROVED (green), REJECTED (red)
- `KYCRejectedReason` — Error card with reason, "Reenviar documentos" button
- `KYCSuccessState` — Checkmark animation, "Identidad verificada" message

### State Management

- **TanStack Query**: KYC status query, submit mutation
- **Local state**: File previews, upload progress
- **Polling**: KYC status polled every 30s while UNDER_REVIEW

### Edge Cases

- **Upload timeout**: Retry with same file, show "Error de conexión. Reintentando..."
- **Partial upload (power loss)**: Resume from last uploaded file
- **Multiple submissions**: Only latest submission is reviewed, previous is superseded
- **Camera access for selfie**: Graceful fallback to file upload
- **Document type mismatch**: Front must be ID card, selfie must be face only
