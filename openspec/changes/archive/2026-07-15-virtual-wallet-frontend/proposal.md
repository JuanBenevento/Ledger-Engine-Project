# Proposal: Virtual Wallet Frontend

## Intent

Crear la aplicación frontend para Ledger Engine Virtual Wallet. El backend está completo (27 tareas, 201 tests, 25+ endpoints REST, OpenAPI spec de 942 líneas). No existe código frontend — debe crearse desde cero como consumidor externo del API REST vía contrato OpenAPI. El mercado objetivo es LATAM fintech (COP, PSE, Keycloak auth).

## Scope

### In Scope
- Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- API client generado desde OpenAPI spec (openapi-typescript + openapi-fetch)
- Autenticación Keycloak (login, registro, refresh tokens, 2FA)
- Dashboard con vista de wallets y balance en tiempo real
- Recargas: tarjeta, PSE, efectivo con flujo de referencia
- Transferencias P2P (email/teléfono) con búsqueda de destinatario
- Pagos QR (fijo/dinámico, escaneo y pago)
- Pagos de servicios (EMCALI, VARIANDES, etc.) con favoritos
- Notificaciones en tiempo real (WebSocket/SSE) y bandeja de entrada
- Seguridad: 2FA, gestión de dispositivos, flujo KYC
- Deploy en Vercel (staging + production)
- Tests E2E con Playwright

### Out of Scope
- App móvil (React Native) — futura fase
- Pagos con tarjeta de crédito/débito (integración PayU/Stripe) — requiere acuerdos comerciales
- KYC con cámara/selfie — Fase 2 con librerías existentes
- Dashboard admin para merchants
- Monetización o planes premium

## Capabilities

### New Capabilities
- `auth-login`: Login Keycloak, registro, recuperación de contraseña, verificación email/phone
- `wallet-management`: CRUD de wallets, balance en tiempo real, historial de transacciones
- `topup-flows`: Recarga con tarjeta, PSE (redirect), efectivo (referencia + confirmación)
- `p2p-transfers`: Envío de dinero por email/teléfono, búsqueda de destinatario, historial
- `qr-payments`: Generación de QR (fijo/dinámico), escaneo, pago, historial
- `bill-payments`: Pago de servicios públicos, facturadores favoritos, historial
- `notifications`: Bandeja de entrada, notificaciones real-time, preferencias
- `security-2fa`: Habilitar/deshabilitar 2FA, gestión de dispositivos confiables
- `kyc-flow`: Flujo de verificación de identidad con upload de documentos

### Modified Capabilities
None — este es un proyecto nuevo sin specs existentes.

## Approach

- **API-first**: Generar tipos TypeScript desde OpenAPI spec del backend existente
- **Server state con TanStack Query**: Caching, revalidation, optimistic updates — NO Redux/Zustand para datos del servidor
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Autenticación**: Keycloak via `@react-keycloak/web`, tokens en httpOnly cookies
- **WebSocket**: Servicio manejado (Ably) o SSE para compatibilidad con Vercel
- **LATAM**: Formato COP `$ 1.234.567`, validación E.164, soporte CC/CE

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/changes/virtual-wallet-frontend/` | New | Todos los artefactos SDD del frontend |
| `ledger-engine-frontend/` | New | Proyecto Next.js completo |
| Backend `CORS` config | Modified | Agregar origen Vercel a CORS allowed origins |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CORS entre Vercel y Render | Alta | Configurar CORS en Spring Boot, proxy inverso en Next.js API routes |
| Keycloak configuration | Media | Documentar realm/client, script de setup, probar auth antes de features |
| WebSocket en Vercel | Alta | Usar Ably (servicio manejado) o SSE nativo |
| Token management | Media | Refresh automático, httpOnly cookies, manejo de expiración |
| Render cold start (latencia) | Media | Optimistic updates, cache agresivo, skeleton loaders |
| KYC flow complejidad | Media | Fase 1: formulario simple. Fase 2: cámara/selfie |

## Rollback Plan

- Frontend es desacoplado del backend — rollback = desactivar deploy en Vercel
- No hay migraciones de base de datos que revertir
- Backend sigue funcionando independientemente
- Feature flags en Vercel para habilitar/deshabilitar rutas

## Dependencies

- **Backend**: 25+ endpoints REST documentados en OpenAPI spec (ya completados)
- **Keycloak**: Realm configurado con roles USER/MERCHANT/ADMIN
- **Supabase**: PostgreSQL para datos de usuario (ya configurado)
- **Vercel**: Deploy frontend (cuenta existente)
- **Render**: Deploy backend (cuenta existente)
- **Ably**: Servicio WebSocket para notificaciones en tiempo real

## Success Criteria

- [ ] Login/logout con Keycloak funcional (tokens, refresh, logout)
- [ ] Dashboard muestra wallets con balance en tiempo real (< 200ms)
- [ ] Flujo de recarga completo (tarjeta, PSE, efectivo)
- [ ] Transferencia P2P exitosa con notificación al destinatario
- [ ] Pago de servicios con favoritos e historial
- [ ] Notificaciones en tiempo real < 1s de entrega
- [ ] 2FA funcional (enable/verify/disable)
- [ ] Lighthouse performance > 90
- [ ] Tests E2E passing con Playwright
- [ ] Deploy staging + production en Vercel
