# Design: Virtual Wallet Frontend

## Technical Approach

Crear aplicación Next.js 14 (App Router) como consumidor externo del API REST del backend existente. API-first: tipos TypeScript generados desde OpenAPI spec (942 líneas, 25+ endpoints). Server state manejado exclusivamente por TanStack Query. Autenticación Keycloak con tokens en httpOnly cookies. Desacoplado del backend — deploy independiente en Vercel.

## Architecture Decisions

### Decision: API Client Generation

**Choice**: `openapi-typescript` + `openapi-fetch` para generar tipos y cliente HTTP tipado
**Alternativas considered**: Axios manual, SWR + custom hooks, RTK Query
**Rationale**: Tipos generados desde OpenAPI garantizan contrato frontend-backend. `openapi-fetch` es liviano y tipado. Sin overhead de Redux.

### Decision: State Management

**Choice**: TanStack Query (server state) + Zustand (UI state mínimo)
**Alternativas considered**: Redux Toolkit, Jotai, Context API puro
**Rationale**: Server state = 90% del estado. TanStack Query maneja cache, revalidation, optimistic updates. Zustand solo para UI (sidebar open, theme). NO Redux — overkill para este caso.

### Decision: Real-time Notifications

**Choice**: Ably (servicio manejado) para WebSocket/SSE
**Alternativas considered**: Socket.io self-hosted, SSE nativo, Polling
**Rationale**: Vercel no soporta WebSocket persistente. Ably maneja reconexión, fallback SSE, y funciona con serverless. Polling ineficiente para fintech real-time.

### Decision: Authentication

**Choice**: Keycloak self-hosted + `@react-keycloak/web` + httpOnly cookies
**Alternativas considered**: Auth0, Clerk, NextAuth.js
**Rationale**: Keycloak ya configurado en backend (realm con roles USER/MERCHANT/ADMIN). Self-hosted = control total. httpOnly cookies previenen XSS. Refresh automático.

### Decision: Styling

**Choice**: Tailwind CSS + shadcn/ui (componentes copiados, no dependencia)
**Alternativas considered**: MUI, Chakra UI, Ant Design
**Rationale**: shadcn/ui copia componentes al proyecto (sin lock-in). Tailwind = performance y consistencia. Componentes accesibles por defecto.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (CDN + Edge)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Next.js 14 App Router                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ RSC/SSR  │  │  Client  │  │ API Routes    │   │   │
│  │  │ (Pages)  │  │ (React)  │  │ (Proxy/Auth)  │   │   │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │   │
│  │       │              │               │            │   │
│  │  ┌────┴──────────────┴───────────────┴──────┐    │   │
│  │  │        TanStack Query + API Client        │    │   │
│  │  │   (openapi-fetch types from OpenAPI)      │    │   │
│  │  └─────────────────┬────────────────────────┘    │   │
│  └────────────────────┼─────────────────────────────┘   │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTPS (CORS configured)
                        ▼
┌───────────────────────────────────────────────────────┐
│                RENDER (Backend)                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │     Spring Boot — 25+ REST endpoints             │ │
│  │     OpenAPI Spec (942 lines)                     │ │
│  │     Hexagonal Architecture + DDD                  │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│              SERVICES                                  │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │ Keycloak │  │  Ably    │  │ Supabase/PostgreSQL │  │
│  │ (Auth)   │  │ (WS/SSE) │  │ (Database)          │  │
│  └─────────┘  └──────────┘  └─────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → React Component → TanStack Query Hook → openapi-fetch Client
     │                                                        │
     │                                                        ▼
     │                                               API Request (typed)
     │                                                        │
     │                                                        ▼
     │                                               Backend REST API
     │                                                        │
     ▼                                                        ▼
Optimistic Update ← Query Cache Update ← Response (typed) ← DB/Service
```

## Project Structure

```
ledger-engine-frontend/
├── public/                          # Static assets
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (providers, fonts)
│   │   ├── page.tsx                 # Landing / redirect
│   │   ├── (auth)/                  # Auth group (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/             # Dashboard group (sidebar)
│   │   │   ├── layout.tsx           # Sidebar + header layout
│   │   │   ├── wallets/page.tsx
│   │   │   ├── wallets/[id]/page.tsx
│   │   │   ├── topup/page.tsx
│   │   │   ├── transfer/page.tsx
│   │   │   ├── qr/page.tsx
│   │   │   ├── bills/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── security/page.tsx
│   │   │   └── kyc/page.tsx
│   │   └── api/                     # Next.js API routes (proxy)
│   │       └── auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                      # shadcn/ui atoms (button, card, input...)
│   │   ├── atoms/                   # Custom atoms (balance-display, currency-input)
│   │   ├── molecules/               # Compound (wallet-card, transaction-row, notification-item)
│   │   ├── organisms/               # Complex (wallet-list, topup-form, transfer-form)
│   │   ├── templates/               # Page layouts (dashboard-layout, auth-layout)
│   │   └── providers/               # React providers (query, keycloak, theme)
│   ├── hooks/                       # Custom hooks
│   │   ├── use-wallets.ts           # TanStack Query hooks for wallets
│   │   ├── use-transfers.ts
│   │   ├── use-topups.ts
│   │   ├── use-notifications.ts
│   │   ├── use-auth.ts
│   │   └── use-currency.ts          # COP formatting hook
│   ├── lib/
│   │   ├── api-client.ts            # openapi-fetch client setup
│   │   ├── keycloak.ts              # Keycloak config
│   │   ├── ably.ts                  # Ably WebSocket setup
│   │   ├── utils.ts                 # cn(), formatCurrency(), etc.
│   │   └── validations.ts           # Zod schemas
│   ├── types/
│   │   └── api-generated.ts         # Auto-generated from OpenAPI
│   └── stores/
│       └── ui-store.ts              # Zustand: sidebar, theme, locale
├── tests/
│   ├── unit/                        # Vitest unit tests
│   ├── integration/                 # API integration tests
│   └── e2e/                         # Playwright E2E tests
├── openapi.yaml                     # Copied from backend (source of truth)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vitest.config.ts
├── playwright.config.ts
└── .env.local                       # Environment variables
```

## Authentication Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   Keycloak   │────▶│   Backend    │
│              │     │   (Self-hosted)   │              │
│  1. Login    │     │              │     │              │
│  2. Token    │◀────│  3. JWT +    │     │  4. Validate │
│  3. Cookie   │     │  Refresh     │     │  JWT         │
└─────────────┘     └──────────────┘     └──────────────┘

Flow:
1. User → /login → Keycloak login page
2. Keycloak → JWT (access + refresh tokens)
3. Tokens → httpOnly cookies (NOT localStorage)
4. API requests → Cookie header → Backend validates JWT
5. Refresh → Keycloak token endpoint → New JWT → New cookie
6. Logout → Keycloak logout → Clear cookies → Redirect
```

**Protected Routes**: Next.js middleware checks `session` cookie. Unauthenticated → redirect to `/login`.

**Roles**: `USER` (default), `MERCHANT`, `ADMIN` — Keycloak realm roles. Checked via JWT claims in middleware and client-side.

## API Integration Layer

```typescript
// src/lib/api-client.ts
import createClient from "openapi-fetch";
import type { paths } from "@/types/api-generated";

const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.staging.ledger-engine.com",
  credentials: "include", // Send httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
```

```typescript
// src/hooks/use-wallets.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/query";
import api from "@/lib/api-client";

export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/wallets");
      return data;
    },
  });
}

export function useWalletBalance(walletId: string) {
  return useQuery({
    queryKey: ["wallets", walletId, "balance"],
    queryFn: async () => {
      const { data } = await api.GET("/api/v1/wallets/{walletId}/balance", {
        params: { path: { walletId } },
      });
      return data;
    },
    refetchInterval: 30_000, // Balance refresh cada 30s
  });
}
```

**Error Handling**: Interceptor en `api-client.ts` que maneja 401 (redirect login), 422 (insufficient funds → toast), 500 (error boundary).

**Loading States**: Skeleton components por defecto. `isPending` → skeleton, `isError` → error boundary, `isSuccess` → data.

**Optimistic Updates**: Para transferencias y pagos — `onMutate` actualiza cache, `onError` revierte, `onSettled` invalida query.

## Component Architecture

| Layer | Example | Responsibility |
|-------|---------|----------------|
| **Atoms** | `BalanceDisplay`, `CurrencyInput`, `StatusBadge` | Renderizado atómico, sin lógica |
| **Molecules** | `WalletCard`, `TransactionRow`, `NotificationItem` | Composición de atoms + lógica mínima |
| **Organisms** | `WalletList`, `TopUpForm`, `TransferForm` | Feature completa, hooks, validación |
| **Templates** | `DashboardLayout`, `AuthLayout` | Layout estructural, sidebar, header |
| **Pages** | `WalletsPage`, `TopUpPage` | Ruta Next.js, data fetching, SEO |

## State Management

| State Type | Solution | Examples |
|------------|----------|----------|
| Server data | TanStack Query | Wallets, balances, transactions, notifications |
| UI state | Zustand | Sidebar open, dark mode, locale |
| Form state | React Hook Form + Zod | Top-up form, transfer form, KYC form |
| URL state | `searchParams`, `useParams` | Tab filters, pagination, wallet selection |

## Styling Strategy

- **Mobile-first**: `sm:`, `md:`, `lg:` breakpoints — diseño responsive LATAM (mayoría mobile)
- **Dark mode**: `dark:` class toggle via Zustand + Tailwind config
- **COP format**: `$ 1.234.567` (punto separador miles, sin decimales)
- **Spanish labels**: Todos los textos en español. Constantes en `src/lib/labels.ts`
- **Font**: Inter (Google Fonts) via `next/font`

## Real-time Notifications

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Ably    │────▶│  React   │────▶│  Toast/Badge  │
│  Channel │     │  Hook    │     │  Notification │
└──────────┘     └──────────┘     └──────────────┘

- Channel: `user:{userId}:notifications`
- Eventos: TOPUP_COMPLETED, P2P_RECEIVED, BILL_PAID, SECURITY_ALERT
- Reconexión automática con exponential backoff
- Fallback: Polling cada 60s si Ably no conecta
```

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | RSC, `next/image`, font optimization |
| FID | < 100ms | Code splitting, lazy loading |
| CLS | < 0.1 | Skeletons, aspect-ratio containers |
| Bundle | < 200KB gzip | Tree shaking, dynamic imports |
| Balance refresh | < 200ms | Redis cache en backend, optimistic UI |

## Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Vitest + React Testing Library | Hooks, utils, formatters |
| Integration | Vitest + MSW | API hooks with mocked backend |
| E2E | Playwright | Critical flows: login, topup, transfer, pay |

**Critical E2E Flows**: Login → Dashboard → Top-up → Transfer → QR Pay → Bill Pay → Notifications → KYC → 2FA → Logout.

## Security

- **XSS**: React escapes by default. No `dangerouslySetInnerHTML`. CSP headers via Next.js config.
- **CSRF**: httpOnly cookies + SameSite=Lax. No tokens in localStorage.
- **Tokens**: httpOnly, Secure, SameSite=Lax. Refresh automático before expiry.
- **API proxy**: Next.js API routes proxy to backend → no CORS issues in production.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.staging.ledger-engine.com
NEXT_PUBLIC_KEYCLOAK_URL=http://keycloak.ledger-engine.com
NEXT_PUBLIC_KEYCLOAK_REALM=ledger-engine
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ledger-engine-web
NEXT_PUBLIC_ABLY_KEY=ably_key_here
```

## Deployment

- **Vercel**: Auto-deploy from `main` branch. Preview deploys for PRs.
- **Domain**: `app.ledger-engine.com` (staging: `app.staging.ledger-engine.com`)
- **CI/CD**: GitHub Actions → lint → test → build → deploy
- **Feature flags**: Vercel Edge Config para habilitar/deshabilitar rutas

## Open Questions

- [ ] ¿Ably tiene tier gratuito suficiente para MVP? Evaluar límites de conexión.
- [ ] ¿Backend CORS ya configurado para Vercel domains? Verificar `@CrossOrigin` en controllers.
- [ ] ¿Keycloak realm ya tiene roles USER/MERCHANT/ADMIN configurados?
