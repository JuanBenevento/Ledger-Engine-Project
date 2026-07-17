## Apply Progress — virtual-wallet-frontend

**Change**: virtual-wallet-frontend
**Last Updated**: 2026-07-08
**Current Phase**: Phase 1 COMPLETE → Ready for Phase 2

---

## Completed Phases

### Phase 0: Foundation ✅ (9/9 tasks)
- [x] 0.1 Initialize Next.js 14 project
- [x] 0.2 Setup shadcn/ui (14 components)
- [x] 0.3 Generate API client from OpenAPI (1342 lines of types)
- [x] 0.4 Configure Keycloak authentication
- [x] 0.5 Create layout system (root, auth, dashboard)
- [x] 0.6 Create landing page
- [x] 0.7 Setup Zustand UI store
- [x] 0.8 Configure environment variables
- [x] 0.9 Setup Vitest + 6 smoke tests

### Phase 1: Auth ✅ (7/7 tasks)
- [x] 1.1 Login page with Keycloak
- [x] 1.2 Register page with validation
- [x] 1.3 Forgot password (anti-enumeration)
- [x] 1.4 Email verification (auto-verify)
- [x] 1.5 Phone verification (OTP 6 digits)
- [x] 1.6 Token refresh automático
- [x] 1.7 Auth middleware (route protection)

---

## Pending Phases

### Phase 2: Core Wallet (8 tasks) — NEXT
- [ ] 2.1 Dashboard con lista de wallets
- [ ] 2.2 Wallet detail con balance
- [ ] 2.3 Crear wallet adicional
- [ ] 2.4 Desactivar wallet
- [ ] 2.5 Formato COP (`$ 1.234.567`)
- [ ] 2.6 Transaction history (paginado)
- [ ] 2.7 Balance display con cache
- [ ] 2.8 Optimistic updates

### Phase 3: TopUps (5 tasks)
- [ ] 3.1 Card top-up form
- [ ] 3.2 PSE redirect flow
- [ ] 3.3 Cash reference generation
- [ ] 3.4 Top-up confirmation
- [ ] 3.5 Top-up history

### Phase 4: P2P Transfers (5 tasks)
- [ ] 4.1 Transfer form (email/phone)
- [ ] 4.2 Recipient search
- [ ] 4.3 Confirmation dialog
- [ ] 4.4 Optimistic updates
- [ ] 4.5 Transfer history

### Phase 5: QR Payments (5 tasks)
- [ ] 5.1 QR generator (fixed/dynamic)
- [ ] 5.2 QR display/share
- [ ] 5.3 QR scanner/camera
- [ ] 5.4 QR pay
- [ ] 5.5 QR history

### Phase 6: Bill Payments (6 tasks)
- [ ] 6.1 Biller search
- [ ] 6.2 Payment form
- [ ] 6.3 Favorites management
- [ ] 6.4 Async polling
- [ ] 6.5 Payment history
- [ ] 6.6 Provider timeout handling

### Phase 7: Notifications (5 tasks)
- [ ] 7.1 Ably WebSocket setup
- [ ] 7.2 Notification inbox
- [ ] 7.3 Toast notifications
- [ ] 7.4 Preferences page
- [ ] 7.5 Unread badge

### Phase 8: Security & KYC (6 tasks)
- [ ] 8.1 2FA TOTP setup
- [ ] 8.2 2FA verify/disable
- [ ] 8.3 Device list
- [ ] 8.4 Device revoke
- [ ] 8.5 KYC document upload
- [ ] 8.6 KYC status tracking

### Phase 9: Polish & Deploy (6 tasks)
- [ ] 9.1 Error boundaries
- [ ] 9.2 Skeleton loaders
- [ ] 9.3 Playwright E2E tests
- [ ] 9.4 Vercel deployment
- [ ] 9.5 CSP headers
- [ ] 9.6 Monitoring setup

---

## Key Decisions Made
- **Font**: Inter (not Geist — requires Next.js 15+)
- **shadcn v4**: Uses `@base-ui/react` (no `asChild` prop)
- **CSS variables**: HSL format (Tailwind v3 compatible)
- **API proxy**: Configured in `next.config.m.mjs` via rewrites
- **WebSocket**: Ably for real-time notifications (Vercel compatible)
- **Auth**: Keycloak with auto-refresh 2min before expiry

## Environment Variables Required
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=ledger-engine
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ledger-frontend
NEXT_PUBLIC_ABLY_KEY=your-ably-key
```

## Build Status
- ✅ `npm run build` passes with zero errors
- ✅ 6 smoke tests passing
