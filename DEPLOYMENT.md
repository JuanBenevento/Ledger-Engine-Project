# Deployment Guide — Ledger Engine (Dual Environment)

## Overview

This guide covers deploying the Ledger Engine Virtual Wallet to **two isolated environments**:

| Environment | Purpose | Branch | URL Pattern |
|-------------|---------|--------|-------------|
| **Production** | Live app for recruiters/hunters | `main` | `ledger-engine.vercel.app` |
| **Staging** | Testing & QA before production | `*` (PR previews) | `ledger-engine-staging.vercel.app` |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase:        ledger-engine-prod                           │
│  Render API:      ledger-engine-api                            │
│  Keycloak:        Cloud-IAM (client: ledger-engine-api)        │
│  Vercel:          ledger-engine.vercel.app                     │
│  Branch:          main                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        STAGING                                  │
├─────────────────────────────────────────────────────────────────┤
│  Supabase:        ledger-engine-staging                        │
│  Render API:      ledger-engine-api-staging                    │
│  Keycloak:        Cloud-IAM (client: ledger-engine-api-staging)│
│  Vercel:          ledger-engine-staging.vercel.app             │
│  Branch:          * (PR previews)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    KEYCLOAK (Shared)                             │
├─────────────────────────────────────────────────────────────────┤
│  Provider:        Cloud-IAM (Freemium)                         │
│  URL:             https://lemur-16.cloud-iam.com/auth           │
│  Realm:           ledger-engine (1 realm — free tier limit)    │
│  Production:      client = ledger-engine-api                   │
│  Staging:         client = ledger-engine-api-staging           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before starting, ensure you have accounts on:

- [ ] **Supabase** — https://supabase.com (2 projects: prod + staging)
- [ ] **Render** — https://render.com (2 services: 2 APIs)
- [ ] **Cloud-IAM** — https://cloud-iam.com (1 free Keycloak instance)
- [ ] **Vercel** — https://vercel.com (1 project with 2 environments)
- [ ] **CloudAMQP** — https://cloudamqp.com (1 free "Little Lemur" instance)
- [ ] **Upstash Redis** — https://upstash.com (1 free instance, or Render Redis)

---

## Step 1: Supabase (Database)

### 1.1 Create TWO Projects

#### Production Project
1. Go to https://supabase.com → **New Project**
2. Project name: `ledger-engine-prod`
3. Database password: (generate a strong password)
4. Region: closest to your users
5. Note the connection details from **Settings > Database**

#### Staging Project
1. Go to https://supabase.com → **New Project**
2. Project name: `ledger-engine-staging`
3. Database password: (generate a different strong password)
4. Region: same as production
5. Note the connection details

### 1.2 Enable Extensions (BOTH projects)

In Supabase SQL Editor for EACH project, run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 1.3 Note Connection Details

For each project, go to **Settings > Database** and note:

| Field | Production | Staging |
|-------|------------|---------|
| Host | `db.xxxxx-prod.supabase.co` | `db.xxxxx-staging.supabase.co` |
| Port | `5432` | `5432` |
| Database | `postgres` | `postgres` |
| User | `postgres` | `postgres` |
| Password | (your password) | (your password) |

### 1.4 Supabase Pooler (Required for Render)

**IMPORTANT**: Render free tier uses IPv4, but Supabase direct connections use IPv6 by default. You MUST use the Supabase pooler for database connections from Render.

Go to **Settings > Database > Connection pooling** and note:

| Field | Production | Staging |
|-------|------------|---------|
| Host | `aws-1-us-west-2.pooler.supabase.com` | `aws-1-us-west-2.pooler.supabase.com` |
| Port | `6543` | `6543` |
| Database | `postgres` | `postgres` |
| User | `postgres.<PROJECT-ID>` | `postgres.<PROJECT-ID>` |
| Password | (same as direct) | (same as direct) |

**Connection string format for Keycloak:**
```
jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&reWriteBatchedInserts=true
```

---

## Step 2: Keycloak (Identity & Access Management)

### Cloud-IAM (Managed Keycloak — Free Tier)

We use **Cloud-IAM** for managed Keycloak instead of self-hosting on Render. Cloud-IAM free tier provides:
- 100 users, 1 realm
- Fully managed (no Docker/infra to maintain)
- No credit card required

#### 2.1 Create Cloud-IAM Account
1. Go to https://www.cloud-iam.com → **Deploy a secured Keycloak now**
2. Create account and verify email
3. Login to console: https://console.cloud-iam.com

#### 2.2 Deploy Keycloak
1. Click **"+ Create deployment"**
2. Configure:
   - **Subscription Plan**: Freemium (free)
   - **Support Level**: Freemium
   - **Deployment Name**: `ledger-engine`
3. Click **"Create deployment"**
4. Wait ~20-30 minutes for deployment
5. Check email for credentials: **"[Cloud-IAM] deployment your deployment name has been completed 🎉"**

#### 2.3 Access Admin Console
1. From email, click the Keycloak console URL
2. Or from Cloud-IAM console → your deployment → **"Keycloak console 🔗"**
3. Login with credentials from the confirmation email

#### 2.4 Create Clients (Shared Realm)

**Important**: Cloud-IAM free tier allows only **1 realm**. We use different clients for staging/production.

##### Production Clients
1. **Clients** → **Create client**
   - Client ID: `ledger-engine-api`
   - Name: Ledger Engine API
   - Standard flow: ON, Direct access grants: ON
   - Valid redirect URIs: `http://localhost:3000/*`, `http://localhost:8080/*`

2. **Clients** → **Create client**
   - Client ID: `ledger-engine-frontend`
   - Name: Ledger Engine Frontend
   - Standard flow: ON
   - Valid redirect URIs: `http://localhost:3000/*`, `http://localhost:3000/auth/callback/*`

##### Staging Clients
1. **Clients** → **Create client**
   - Client ID: `ledger-engine-api-staging`
   - Name: Ledger Engine API (Staging)
   - Standard flow: ON, Direct access grants: ON

2. **Clients** → **Create client**
   - Client ID: `ledger-engine-frontend-staging`
   - Name: Ledger Engine Frontend (Staging)
   - Standard flow: ON

#### 2.5 Keycloak URLs

| Environment | URL |
|-------------|-----|
| **Base URL** | `https://lemur-16.cloud-iam.com/auth` |
| **Issuer URI** | `https://lemur-16.cloud-iam.com/auth/realms/ledger-engine` |
| **JWKS URI** | `https://lemur-16.cloud-iam.com/auth/realms/ledger-engine/protocol/openid-connect/certs` |
| **Admin Console** | `https://lemur-16.cloud-iam.com/auth/admin/ledger-engine/console/` |

> **Note**: Staging and production share the same realm (`ledger-engine`) but use different clients for isolation.

---

## Step 3: Redis & RabbitMQ

### 3.1 Redis (Upstash — Free Tier)

1. Go to https://upstash.com → Sign up
2. Create new database:
   - Name: `ledger-engine-redis`
   - Region: closest to your Render region
3. Note the connection details:
   - Host: `redis-xxxxx.upstash.io`
   - Port: `6379`
   - Password: (from dashboard)

### 3.2 RabbitMQ (CloudAMQP — Free Tier)

1. Go to https://cloudamqp.com → Sign up
2. Create new instance:
   - Name: `ledger-engine-rabbitmq`
   - Plan: **Little Lemur** (free)
   - Region: closest to your Render region
3. Note the connection details from the dashboard

---

## Step 4: Render (Backend API)

### 4.1 Production Service

1. Go to https://render.com → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `ledger-engine-api`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Port**: `8080`
   - **Plan**: Free
   - **Branch**: `main`
   - **Auto Deploy**: Yes
4. Add environment variables (copy from `.env.production.example`):

```env
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&reWriteBatchedInserts=true
SPRING_DATASOURCE_USERNAME=postgres.<PROD-PROJECT-ID>
SPRING_DATASOURCE_PASSWORD=<PROD-SUPABASE-PASSWORD>
SPRING_DATA_REDIS_HOST=redis-xxxxx.upstash.io
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=<YOUR-REDIS-PASSWORD>
SPRING_RABBITMQ_HOST=xxxxx.rmq.cloudamqp.com
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=<YOUR-RABBITMQ-USER>
SPRING_RABBITMQ_PASSWORD=<YOUR-RABBITMQ-PASSWORD>
KEYCLOAK_ISSUER_URI=https://lemur-16.cloud-iam.com/auth/realms/ledger-engine
KEYCLOAK_JWK_SET_URI=https://lemur-16.cloud-iam.com/auth/realms/ledger-engine/protocol/openid-connect/certs
CORS_ALLOWED_ORIGINS=https://ledger-engine.vercel.app
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=when_authorized
LOGGING_LEVEL_COM_JUANBENEVENTO_LEDGER=INFO
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=WARN
JAVA_OPTS=-Xms256m -Xmx512m
LEDGER_ENCRYPTION_KEY=<YOUR-256-BIT-HEX-ENCRYPTION-KEY>
WEBHOOK_HMAC_SECRET=<YOUR-WEBHOOK-HMAC-SECRET>
```

5. Note the URL: `https://ledger-engine-api.onrender.com`

### 4.2 Staging Service

1. Repeat steps 1-4 with:
   - **Name**: `ledger-engine-api-staging`
   - **Branch**: `main` (or `*` for all branches)
   - Uses staging environment variables

2. Note the URL: `https://ledger-engine-api-staging.onrender.com`

---

## Step 5: Vercel (Frontend)

### 5.1 Create Project

1. Go to https://vercel.com → **New Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `ledger-engine-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 5.2 Configure Two Environments

In Vercel Dashboard → **Settings** → **Environment Variables**:

#### For Production (main branch)

| Key | Value | Branch |
|-----|-------|--------|
| `NEXT_PUBLIC_API_URL` | `https://ledger-engine-api.onrender.com` | `main` |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://lemur-16.cloud-iam.com` | `main` |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `ledger-engine` | `main` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `ledger-engine-frontend` | `main` |
| `NEXT_PUBLIC_ABLY_KEY` | `<your-ably-key>` | `main` |
| `NEXT_PUBLIC_APP_ENV` | `production` | `main` |

#### For Staging (all other branches)

| Key | Value | Branch |
|-----|-------|--------|
| `NEXT_PUBLIC_API_URL` | `https://ledger-engine-api-staging.onrender.com` | `*` |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://lemur-16.cloud-iam.com` | `*` |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `ledger-engine` | `*` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `ledger-engine-frontend-staging` | `*` |
| `NEXT_PUBLIC_ABLY_KEY` | `<your-ably-key>` | `*` |
| `NEXT_PUBLIC_APP_ENV` | `staging` | `*` |

### 5.3 Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CORS_ALLOWED_ORIGINS` in Render services

---

## Step 6: Post-Deployment Verification

### 6.1 Backend Health Check

```bash
# Production
curl https://ledger-engine-api.onrender.com/actuator/health
# Expected: {"status":"UP"}

# Staging
curl https://ledger-engine-api-staging.onrender.com/actuator/health
# Expected: {"status":"UP"}
```

### 6.2 Keycloak Health Check

```bash
# Cloud-IAM Keycloak (shared for both environments)
curl https://lemur-16.cloud-iam.com/auth/realms/ledger-engine/.well-known/openid-configuration
# Expected: 200 OK with OpenID configuration JSON
```

### 6.3 Frontend

1. Go to https://ledger-engine.vercel.app (production)
2. Go to https://ledger-engine-staging.vercel.app (staging)
3. Verify both load correctly
4. Test login with Keycloak

### 6.4 Database

1. Go to Supabase Dashboard → **Table Editor**
2. Verify all tables were created by Flyway migrations:
   - `users`
   - `wallets`
   - `transactions`
   - `notifications`

---

## Step 7: CI/CD (GitHub Actions)

The workflow in `.github/workflows/deploy.yml` will automatically:

- Deploy to **staging** when you push to any branch (creates PR preview)
- Deploy to **production** when you merge to `main`

### 7.1 Required Secrets

Add these secrets in GitHub → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Your Vercel API token |
| `VERCEL_ORG_ID` | Your Vercel org ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |
| `RENDER_API_KEY` | Your Render API key |
| `RENDER_PRODUCTION_SERVICE_ID` | Render service ID for production |
| `RENDER_STAGING_SERVICE_ID` | Render service ID for staging |

### 7.2 Get Render Service IDs

1. Go to Render Dashboard → **API** → **Keys**
2. Create an API key
3. For each service, note the Service ID from the URL or API

---

## Troubleshooting

### Backend won't start
- Check environment variables in Render dashboard
- Verify database connection string format
- Check logs: Render Dashboard → **Logs**

### Frontend build fails
- Ensure all environment variables are set in Vercel
- Check build logs: Vercel Dashboard → **Deployments** → **Build Logs**

### CORS errors
- Update `CORS_ALLOWED_ORIGINS` in both Render services
- Ensure frontend URL is correct (no trailing slash)

### Keycloak won't start
- First boot takes ~2 minutes (initialization)
- Check logs for database connection errors
- Verify Supabase extensions are enabled

### Database connection refused
- Verify Supabase project is running
- Check connection string format
- Ensure IP whitelist includes Render IPs (Supabase allows all by default)

---

## Cost Summary (Free Tier)

| Service | Free Tier Limits | Cost |
|---------|------------------|------|
| Supabase | 500MB DB, 50K MAU | $0 |
| Render | 750 hours/month (2 services) | $0 |
| Cloud-IAM | 100 users, 1 realm | $0 |
| Vercel | 100GB bandwidth | $0 |
| CloudAMQP | 1 node, 1GB | $0 |
| Upstash | 10K commands/day | $0 |
| **Total** | | **$0/month** |

### ⚠️ Free Tier Limitations

- **Render**: Services spin down after 15 min of inactivity → cold starts ~30s
- **Supabase**: 500MB database limit
- **Cloud-IAM**: 100 users, 1 realm, no custom themes, no export/import
- **Vercel**: 100GB bandwidth/month

---

## Next Steps After Deployment

1. **Test complete flow**: Register → Login → Create Wallet → Transfers
2. **Set up monitoring**: Prometheus + Grafana (already in docker-compose)
3. **Security audit**: Check OWASP Top 10
4. **Performance testing**: Use k6 or Artillery
5. **Update portfolio**: Add live demo link to your resume

---

## Quick Reference URLs

| Service | Production | Staging |
|---------|------------|---------|
| **Frontend** | https://ledger-engine.vercel.app | https://ledger-engine-staging.vercel.app |
| **Backend API** | https://ledger-engine-api.onrender.com | https://ledger-engine-api-staging.onrender.com |
| **Keycloak** | https://lemur-16.cloud-iam.com/auth | https://lemur-16.cloud-iam.com/auth |
| **Keycloak Realm** | `ledger-engine` | `ledger-engine` (shared) |
| **Keycloak Client** | `ledger-engine-frontend` | `ledger-engine-frontend-staging` |
| **Supabase** | https://supabase.com/dashboard/project/xxxxx-prod | https://supabase.com/dashboard/project/xxxxx-staging |
| **Keycloak Admin** | https://lemur-16.cloud-iam.com/auth/admin/ledger-engine/console/ | (same — shared admin) |
