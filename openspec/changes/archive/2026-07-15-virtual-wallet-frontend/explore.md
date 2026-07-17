# Exploración: Frontend para Ledger Engine Virtual Wallet

## Estado Actual

El backend de Ledger Engine está completo con 27 tareas, 201 tests y 25+ endpoints REST documentados en un OpenAPI spec de 942 líneas. La arquitectura es hexagonal con DDD, Spring Boot 4.x, Java 21, PostgreSQL, Redis, RabbitMQ y Keycloak para autenticación. El frontend está **desacoplado** y se tratará como consumidor externo vía el contrato OpenAPI.

**Decisiones clave ya tomadas:**
- Frontend decoupled: React/React Native como consumidor externo
- Keycloak self-hosted (Docker)
- Multi-module Maven
- OpenAPI spec como fuente de verdad

**No existe ningún código frontend** — el proyecto solo contiene backend Java.

---

## Análisis de la Superficie API

### Autenticación
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Registro de usuario con PII encriptada |
| `/api/v1/auth/login` | POST | Login con JWT (15min) y refresh token (30d) |
| `/api/v1/auth/refresh` | POST | Rotación de refresh token |
| `/api/v1/auth/forgot-password` | POST | Solicitud de reset (siempre 200 para prevenir enumeración) |
| `/api/v1/auth/verify-email` | POST | Verificación de email con token |
| `/api/v1/auth/verify-phone` | POST | Verificación de teléfono con OTP |

### wallets (Billeteras)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/wallets` | POST | Crear billetera adicional |
| `/api/v1/wallets` | GET | Listar billeteras del usuario |
| `/api/v1/wallets/{walletId}` | GET | Detalle de billetera |
| `/api/v1/wallets/{walletId}` | PATCH | Renombrar billetera |
| `/api/v1/wallets/{walletId}/balance` | GET | Balance en tiempo real (Redis cache) |
| `/api/v1/wallets/{walletId}/deactivate` | POST | Desactivar billetera |

### TopUps (Recargas)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/wallets/{walletId}/topup` | POST | Recarga con tarjeta (síncrono) |
| `/api/v1/wallets/{walletId}/topup/cash` | POST | Recarga en efectivo (referencia) |
| `/api/v1/topups/{topUpId}/confirm` | POST | Confirmar recarga en efectivo |
| `/api/v1/wallets/{walletId}/topups` | GET | Historial de recargas |

### Transferencias P2P
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/p2p/transfers` | POST | Enviar dinero por email/teléfono |
| `/api/v1/p2p/transfers` | GET | Historial de transferencias |
| `/api/v1/p2p/transfers/{transferId}` | GET | Detalle de transferencia |

### QR Payments
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/qr/generate` | POST | Generar código QR (fijo/dinámico) |
| `/api/v1/qr/pay` | POST | Pagar con QR escaneado |
| `/api/v1/qr/payments` | GET | Historial de pagos QR |

### Pagos de Servicios (Bills)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/bills/pay` | POST | Pagar factura (EMCALI, VARIANDES, etc.) |
| `/api/v1/bills/favorites` | GET | Obtener facturadores favoritos |
| `/api/v1/bills/favorites` | POST | Guardar facturador favorito |
| `/api/v1/bills/payments` | GET | Historial de pagos de facturas |

### Notificaciones
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/notifications` | GET | Bandeja de notificaciones |
| `/api/v1/notifications/{id}/read` | PUT | Marcar como leída |
| `/api/v1/notifications/read-all` | POST | Marcar todas como leídas |
| `/api/v1/notifications/preferences` | GET | Preferencias de notificación |
| `/api/v1/notifications/preferences` | PUT | Actualizar preferencias |
| WebSocket: `/ws/notifications` | WS | Notificaciones en tiempo real |

### Seguridad
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/security/2fa/enable` | POST | Habilitar 2FA (TOTP) |
| `/api/v1/security/2fa/verify` | POST | Verificar código 2FA |
| `/api/v1/security/2fa/disable` | POST | Deshabilitar 2FA |
| `/api/v1/security/devices` | GET | Listar dispositivos confiables |
| `/api/v1/security/devices/{deviceId}` | DELETE | Revocar dispositivo |

### KYC
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/kyc/submit` | POST | Enviar documentos KYC |
| `/api/v1/kyc/{userId}/approve` | POST | Aprobar KYC (auto-crea wallet) |

### Cuentas (Legacy)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/accounts` | POST | Crear cuenta (deprecated, usar wallets) |
| `/api/v1/accounts/{accountId}/history` | GET | Historial de transacciones |
| `/api/v1/accounts/{id}/status` | PATCH | Cambiar estado (FREEZE/ACTIVATE) |

### Transferencias (Legacy)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/transfers` | POST | Transferencia entre cuentas |
| `/api/v1/deposits` | POST | Depósito de efectivo |

---

## Mapeo de Historias de Usuario a Endpoints

### Registro y Onboarding
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-UI-01: Registro con email/teléfono | `POST /auth/register`, `POST /auth/verify-email`, `POST /auth/verify-phone` |
| US-UI-02: Verificación KYC | `POST /kyc/submit`, `POST /kyc/{userId}/approve` |
| US-UI-03: Actualizar perfil | `PUT /users/{userId}/profile` (no en OpenAPI actual) |
| US-UI-04: Reset password | `POST /auth/forgot-password` |
| US-UI-05: Verificar teléfono OTP | `POST /auth/verify-phone` |

### Gestión de Billeteras
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-WM-01: Auto-crear wallet | `POST /kyc/{userId}/approve` (auto-crea) |
| US-WM-02: Crear wallet adicional | `POST /wallets` |
| US-WM-03: Ver todas las wallets | `GET /wallets` |
| US-WM-04: Renombrar/desactivar | `PATCH /wallets/{id}`, `POST /wallets/{id}/deactivate` |
| US-WM-05: Balance en tiempo real | `GET /wallets/{id}/balance` |

### Recargas (TopUps)
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-TR-01: Recarga PSE | `POST /wallets/{id}/topup` (method=PSE) |
| US-TR-02: Recarga con tarjeta | `POST /wallets/{id}/topup` (method=CARD) |
| US-TR-03: Recarga en efectivo | `POST /wallets/{id}/topup/cash`, `POST /topups/{id}/confirm` |
| US-TR-04: Estado de recarga | `GET /wallets/{id}/topups` |
| US-TR-05: Historial de recargas | `GET /wallets/{id}/topups` |

### Transferencias P2P
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-P2P-01: Enviar por email | `POST /p2p/transfers` |
| US-P2P-02: Enviar por teléfono | `POST /p2p/transfers` |
| US-P2P-03: Pagar con QR | `POST /qr/pay` |
| US-P2P-04: Agregar nota | `POST /p2p/transfers` (campo note) |
| US-P2P-05: Notificación recepción | WebSocket `/ws/notifications` |
| US-P2P-06: Historial P2P | `GET /p2p/transfers` |

### Pagos QR
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-QR-01: QR monto fijo | `POST /qr/generate` (amount presente) |
| US-QR-02: QR dinámico | `POST /qr/generate` (sin amount) |
| US-QR-03: Pagar con QR | `POST /qr/pay` |
| US-QR-04: Notificación merchant | WebSocket `/ws/notifications` |
| US-QR-05: Historial QR | `GET /qr/payments` |

### Pagos de Servicios
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-BP-01: Pagar servicios | `POST /bills/pay` |
| US-BP-02: Escanear código barras | `POST /bills/pay` (barcode integration) |
| US-BP-03: Historial pagos | `GET /bills/payments` |
| US-BP-04: Facturadores favoritos | `GET /bills/favorites`, `POST /bills/favorites` |

### Notificaciones
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-NF-01: Push en tiempo real | WebSocket `/ws/notifications` |
| US-NF-02: Estado top-up | WebSocket |
| US-NF-03: Transacciones fallidas | WebSocket |
| US-NF-04: Preferencias | `GET /notifications/preferences`, `PUT /notifications/preferences` |
| US-NF-05: Bandeja de entrada | `GET /notifications` |

### Seguridad
| Historia | Endpoints Necesarios |
|----------|---------------------|
| US-SA-01: Habilitar 2FA | `POST /security/2fa/enable`, `POST /security/2fa/verify` |
| US-SA-02: Autenticación biométrica | Keycloak (fuera de backend) |
| US-SA-03: Gestión dispositivos | `GET /security/devices` |
| US-SA-04: Revocar dispositivo | `DELETE /security/devices/{id}` |
| US-SA-05: Detección sospechosa | Backend (no frontend) |

---

## Propuesta de Arquitectura Frontend

### Stack Tecnológico
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query) para server state
- **Autenticación**: Keycloak via `@react-keycloak/web`
- **API Client**: `openapi-typescript` + `openapi-fetch` + `openapi-react-query`
- **WebSocket**: Socket.io client (servidor separado) o servicio manejado (Ably/Pusher)
- **Deploy**: Vercel

### Estructura de Directorios (Next.js App Router)

```
ledger-engine-frontend/
├── app/                          # App Router
│   ├── (auth)/                   # Grupo de rutas autenticadas
│   │   ├── layout.tsx           # Layout con sidebar/header
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard principal
│   │   ├── wallets/
│   │   │   ├── page.tsx         # Lista de wallets
│   │   │   └── [walletId]/
│   │   │       ├── page.tsx     # Detalle wallet
│   │   │       └── topup/
│   │   │           └── page.tsx # Flujo de recarga
│   │   ├── transfer/
│   │   │   └── page.tsx         # Enviar dinero P2P
│   │   ├── qr/
│   │   │   ├── generate/
│   │   │   │   └── page.tsx     # Generar QR
│   │   │   └── pay/
│   │   │       └── page.tsx     # Pagar con QR
│   │   ├── bills/
│   │   │   ├── page.tsx         # Pagar servicios
│   │   │   └── favorites/
│   │   │       └── page.tsx     # Facturadores favoritos
│   │   ├── notifications/
│   │   │   └── page.tsx         # Bandeja de notificaciones
│   │   └── settings/
│   │       ├── page.tsx         # Perfil
│   │       ├── security/
│   │       │   └── page.tsx     # 2FA, dispositivos
│   │       └── kyc/
│   │           └── page.tsx     # Verificación KYC
│   ├── (public)/                 # Rutas públicas
│   │   ├── login/
│   │   │   └── page.tsx         # Login Keycloak
│   │   ├── register/
│   │   │   └── page.tsx         # Registro
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── layout.tsx               # Root layout (html, body)
│   ├── page.tsx                 # Landing page
│   └── not-found.tsx
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── features/                # Componentes de negocio
│   │   ├── wallet/
│   │   │   ├── wallet-card.tsx
│   │   │   ├── wallet-list.tsx
│   │   │   ├── balance-display.tsx
│   │   │   └── topup-form.tsx
│   │   ├── transfer/
│   │   │   ├── transfer-form.tsx
│   │   │   ├── transfer-history.tsx
│   │   │   └── recipient-search.tsx
│   │   ├── qr/
│   │   │   ├── qr-generator.tsx
│   │   │   ├── qr-scanner.tsx
│   │   │   └── qr-display.tsx
│   │   ├── bills/
│   │   │   ├── bill-payment-form.tsx
│   │   │   ├── biller-list.tsx
│   │   │   └── favorites-list.tsx
│   │   ├── notifications/
│   │   │   ├── notification-bell.tsx
│   │   │   ├── notification-list.tsx
│   │   │   └── notification-item.tsx
│   │   └── auth/
│   │       ├── login-button.tsx
│   │       ├── user-menu.tsx
│   │       └── two-factor-setup.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       ├── mobile-nav.tsx
│       └── footer.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts            # openapi-fetch client setup
│   │   ├── hooks/               # Hooks generados por openapi-react-query
│   │   └── types/               # Tipos TypeScript generados
│   ├── auth/
│   │   ├── keycloak.ts          # Configuración Keycloak
│   │   └── providers.tsx        # KeycloakProvider wrapper
│   ├── websocket/
│   │   ├── socket.ts            # Socket.io client setup
│   │   └── use-notifications.ts # Hook para notificaciones real-time
│   └── utils/
│       ├── format-currency.ts   # Formato COP
│       ├── validators.ts        # Validaciones LATAM
│       └── constants.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-wallet.ts
│   ├── use-transfer.ts
│   └── use-notifications.ts
├── stores/                      # Si se necesita estado global
│   └── app-store.ts             # Zustand (ligero)
├── public/
│   ├── images/
│   └── icons/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Jerarquía de Componentes (Atomic Design)

```
Atoms → Molecules → Organisms → Templates → Pages

Atoms:
  - Button, Input, Badge, Avatar, Icon
  - BalanceDisplay, CurrencyFormat

Molecules:
  - WalletCard (atom: balance + icon)
  - TransferForm (atoms: input, button, select)
  - NotificationItem (atom: icon, text, time)
  - BillerCard (atoms: name, category, icon)

Organisms:
  - WalletList (molecules: wallet-card)
  - TransferHistory (molecules: table, filters)
  - NotificationBell (molecule: badge + list)
  - TopUpFlow (molecules: method selector, form)

Templates:
  - DashboardLayout (organisms: header, sidebar, content)
  - AuthLayout (organisms: form, branding)

Pages:
  - DashboardPage (template: dashboard + organisms: wallet-list, recent-transfers)
  - TransferPage (template: dashboard + organism: transfer-form)
```

### Flujo de Autenticación (Keycloak + JWT)

```
1. Usuario hace click "Login" → redirect a Keycloak
2. Keycloak autentica (email/password o social)
3. Keycloak redirige de vuelta con code
4. Next.js exchange code por tokens (access + refresh)
5. Tokens se almacenan en httpOnly cookie (seguro)
6. Cada request API incluye Authorization: Bearer {accessToken}
7. Token refresh automático antes de expirar (15min)
8. Logout: limpiar cookies + redirect a Keycloak logout
```

**Implementación:**
```typescript
// lib/auth/keycloak.ts
import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
}

export const keycloak = new Keycloak(keycloakConfig)

// lib/auth/providers.tsx
'use client'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import { keycloak } from './keycloak'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      {children}
    </ReactKeycloakProvider>
  )
}
```

### Estrategia de Generación de API Client

```bash
# 1. Generar tipos TypeScript desde OpenAPI
npx openapi-typescript ./openapi.yaml -o ./lib/api/types/api.d.ts

# 2. Setup del cliente
import createFetchClient from "openapi-fetch"
import createClient from "openapi-react-query"
import type { paths } from "./types/api"

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
})

export const $api = createClient(fetchClient)

# 3. Uso en componentes
const { data, isLoading } = $api.useQuery("get", "/wallets")
const mutation = $api.useMutation("post", "/wallets/{walletId}/topup")
```

### Notificaciones en Tiempo Real (WebSocket)

**Opción recomendada:** Servicio manejado (Ably/Pusher) ya que Vercel no soporta WebSockets nativos.

```
Alternativa 1: Servidor Socket.io separado
  - Deploy en Railway/Render
  - Más control, más complejidad
  - Requiere infraestructura adicional

Alternativa 2: Servicio manejado (Ably/Pusher)
  - Deploy en Vercel compatible
  - Escalable, confiable
  - Costo adicional (~$50/mes para 1M mensajes)

Alternativa 3: Server-Sent Events (SSE)
  - Nativo de Next.js
  - Unidireccional (suficiente para notificaciones)
  - Sin infraestructura adicional
```

**Implementación con Ably:**
```typescript
// lib/websocket/ably-client.ts
import Ably from 'ably'

const ably = new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_ABLY_KEY,
  clientId: userId, // from Keycloak token
})

export const notificationsChannel = ably.channels.get(`user:${userId}:notifications`)
```

---

## Riesgos Técnicos

### Riesgo 1: CORS entre Vercel y Backend (Render)
**Probabilidad**: Alta
**Impacto**: Alto
**Mitigación**: Configurar CORS en Spring Boot para permitir origen de Vercel. Usar variables de entorno para URLs. Considerar proxy inverso en Next.js API routes.

### Riesgo 2: Keycloak Configuration
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**: Documentar configuración exacta de realm/client. Crear script de setup de Keycloak. Probar flujo completo de auth antes de desarrollar features.

### Riesgo 3: WebSocket en Vercel
**Probabilidad**: Alta (si se elige Socket.io)
**Impacto**: Medio
**Mitigación**: Usar servicio manejado (Ably/Pusher) o SSE. Si se necesita Socket.io, deploy en servidor separado (Railway/Render).

### Riesgo 4: Token Management
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**: Implementar refresh automático. Manejar expiración de sesión. Almacenar tokens en httpOnly cookies (no localStorage).

### Riesgo 5: Latencia API (Render cold start)
**Probabilidad**: Media
**Impacto**: Medio
**Mitigación**: Implementar optimistic updates en React Query. Cache agresivo. Mostrar skeletons mientras se carga.

### Riesgo 6: Formato de Moneda COP
**Probabilidad**: Baja
**Impacto**: Bajo
**Mitigación**: Usar `Intl.NumberFormat` con locale `es-CO`. Validar que backend retorna montos como strings decimales.

### Riesgo 7: KYC Flow Complejidad
**Probabilidad**: Media
**Impacto**: Medio
**Mitigación**: Fase 1: Formulario simple. Fase 2: Integración con cámara/selfie. Usar librerías existentes (react-webcam).

---

## Fases de Implementación

### Fase 0: Fundación (Semana 1-2)
- [ ] Inicializar proyecto Next.js 14 con TypeScript
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Generar API client desde OpenAPI spec
- [ ] Configurar Keycloak (realm, client, roles)
- [ ] Implementar flujo de autenticación completo
- [ ] Layout base (header, sidebar, responsive)
- [ ] Variables de entorno y configuración de deploy

### Fase 1: Core Wallet (Semana 3-4)
- [ ] Dashboard con vista de wallets
- [ ] Crear wallet adicional
- [ ] Ver detalle de wallet con balance
- [ ] Historial de transacciones (paginado)
- [ ] Formato de moneda COP

### Fase 2: TopUps (Semana 5-6)
- [ ] Recarga con tarjeta (integración PayU/Stripe)
- [ ] Recarga PSE (redirect flow)
- [ ] Recarga en efectivo (referencia + confirmación)
- [ ] Historial de recargas

### Fase 3: P2P Transfers (Semana 7-8)
- [ ] Formulario de transferencia (email/teléfono)
- [ ] Búsqueda de destinatario
- [ ] Confirmación con resumen
- [ ] Historial de transferencias

### Fase 4: QR Payments (Semana 9)
- [ ] Generar QR (fijo/dinámico)
- [ ] Mostrar QR para compartir
- [ ] Escanear QR y pagar
- [ ] Historial de pagos QR

### Fase 5: Bill Payments (Semana 10)
- [ ] Lista de facturadores
- [ ] Formulario de pago (referencia + monto)
- [ ] Guardar favoritos
- [ ] Historial de pagos

### Fase 6: Notificaciones (Semana 11)
- [ ] Bandeja de notificaciones
- [ ] Notificaciones en tiempo real (WebSocket/SSE)
- [ ] Preferencias de notificación
- [ ] Badge de notificaciones no leídas

### Fase 7: Seguridad y KYC (Semana 12)
- [ ] Habilitar/deshabilitar 2FA
- [ ] Gestión de dispositivos
- [ ] Flujo KYC (subir documentos)
- [ ] Estado de verificación

### Fase 8: Polish y Deploy (Semana 13-14)
- [ ] Optimización de performance (Lighthouse > 90)
- [ ] SEO y meta tags
- [ ] Error boundaries y loading states
- [ ] Tests E2E (Playwright)
- [ ] Deploy a Vercel (staging + production)
- [ ] Monitoreo (Vercel Analytics, Sentry)

---

## Dependencias NPM

### Core
```json
{
  "next": "14.2.x",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.4.0"
}
```

### UI
```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "lucide-react": "^0.378.0",
  "tailwind-merge": "^2.3.0",
  "tailwindcss-animate": "^1.0.7",
  "framer-motion": "^11.0.0"
}
```

### API Client
```json
{
  "openapi-typescript": "^6.7.0",
  "openapi-fetch": "^0.9.0",
  "openapi-react-query": "^0.1.0",
  "@tanstack/react-query": "^5.50.0"
}
```

### Auth
```json
{
  "@react-keycloak/web": "^3.4.0",
  "keycloak-js": "^24.0.0"
}
```

### WebSocket (si se usa servicio manejado)
```json
{
  "ably": "^1.2.0"
}
```

### Utilidades
```json
{
  "zustand": "^4.5.0",
  "date-fns": "^3.6.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### Testing
```json
{
  "@testing-library/react": "^15.0.0",
  "@testing-library/jest-dom": "^6.4.0",
  "jest": "^29.7.0",
  "@playwright/test": "^1.44.0"
}
```

### Desarrollo
```json
{
  "eslint": "^8.57.0",
  "eslint-config-next": "14.2.x",
  "prettier": "^3.2.0",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
```

---

## Recomendación

**Enfoque recomendado: Fase 0 + Fase 1 primero.**

1. **Priorizar autenticación**: Sin Keycloak funcionando, nada más funciona. Invertir tiempo en configurar correctamente el realm de Keycloak, los roles, y el flujo de login/registro.

2. **API Client generation**: Usar `openapi-typescript` para generar tipos desde el spec. Esto garantiza type safety y detecta cambios en el backend automáticamente.

3. **Estado del servidor con React Query**: NO usar Redux/Zustand para datos del servidor. React Query maneja caching, revalidation, optimistic updates. Zustand solo para UI state (sidebar abierto, tema oscuro, etc.).

4. **WebSocket**: Para MVP, usar polling cada 30 segundos para notificaciones. Para producción, integrar Ably o Pusher. NO intentar Socket.io en Vercel.

5. **Deploy temprano**: Deploy a Vercel en Fase 0 para validar CORS, environment variables, y dominio. Mejor detectar problemas de infraestructura temprano.

6. **LATAM considerations**:
   - Formato de moneda: `$ 1.234.567` (punto separador de miles, coma para decimales)
   - Validación de teléfono: formato E.164 (+57...)
   - Soporte para cédula de ciudadanía (CC) y cédula de extranjería (CE)
   - Nombres con caracteres especiales (tildes, ñ)

---

## Listo para Propuesta

**SÍ** — La exploración está completa. Se tiene:
- OpenAPI spec analizado (25+ endpoints)
- User stories mapeadas a endpoints
- Arquitectura frontend definida
- Stack tecnológico decidido
- Riesgos identificados con mitigaciones
- Fases de implementación claras
- Dependencias listadas

**Próximo paso recomendado**: `sdd-propose` para crear la propuesta formal del cambio `virtual-wallet-frontend`.
