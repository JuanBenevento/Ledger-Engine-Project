import { http, HttpResponse } from "msw";

// API Base URL for testing
const API_BASE_URL = "http://localhost:8080";

// API handlers for testing
export const handlers = [
  // Wallets
  http.get(`${API_BASE_URL}/api/v1/wallets`, () => {
    return HttpResponse.json({
      wallets: [
        {
          walletId: "wallet-1",
          name: "Mi Ahorro",
          currency: "COP",
          status: "ACTIVE",
          createdAt: "2026-01-15T10:00:00Z",
        },
        {
          walletId: "wallet-2",
          name: "Gastos Diarios",
          currency: "COP",
          status: "ACTIVE",
          createdAt: "2026-02-20T14:30:00Z",
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/api/v1/wallets/:walletId`, ({ params }) => {
    const { walletId } = params;
    return HttpResponse.json({
      walletId,
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE",
      createdAt: "2026-01-15T10:00:00Z",
      balance: 1250000,
    });
  }),

  http.get(`${API_BASE_URL}/api/v1/wallets/:walletId/balance`, () => {
    return HttpResponse.json({
      available: 1250000,
      pending: 50000,
      currency: "COP",
      lastUpdated: new Date().toISOString(),
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/wallets`, async ({ request }) => {
    const body = (await request.json()) as { name: string; currency: string };
    return HttpResponse.json(
      {
        walletId: "wallet-new",
        name: body.name,
        currency: body.currency || "COP",
        status: "ACTIVE",
      },
      { status: 201 }
    );
  }),

  http.patch(`${API_BASE_URL}/api/v1/wallets/:walletId`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    const { walletId } = params;
    return HttpResponse.json({
      walletId,
      name: body.name,
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/wallets/:walletId/deactivate`, () => {
    return HttpResponse.json({
      status: "INACTIVE",
    });
  }),

  // Transactions (placeholder - not in backend yet)
  http.get(`${API_BASE_URL}/api/v1/wallets/:walletId/transactions`, () => {
    return HttpResponse.json({
      content: [
        {
          transactionId: "txn-1",
          type: "DEPOSIT",
          amount: 100000,
          currency: "COP",
          status: "COMPLETED",
          description: "Recarga PSE",
          createdAt: new Date().toISOString(),
        },
        {
          transactionId: "txn-2",
          type: "TRANSFER",
          amount: -50000,
          currency: "COP",
          status: "COMPLETED",
          description: "Transferencia a Carlos",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      pagination: {
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
      },
    });
  }),

  // Auth
  http.post(`${API_BASE_URL}/api/v1/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    return HttpResponse.json(
      {
        userId: "user-new",
        email: body.email,
        phone: "+573001234567",
        status: "PENDING_VERIFICATION",
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "test@test.com" && body.password === "password123") {
      return HttpResponse.json({
        accessToken: "access-token-mock",
        refreshToken: "refresh-token-mock",
        expiresIn: 300,
      });
    }
    return HttpResponse.json(
      { message: "Credenciales incorrectas" },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/forgot-password`, () => {
    return HttpResponse.json({
      message: "Si el email existe, recibirás un enlace",
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/verify-email`, () => {
    return HttpResponse.json({ verified: true });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/verify-phone`, async ({ request }) => {
    const body = (await request.json()) as { otp: string };
    if (body.otp === "123456") {
      return HttpResponse.json({ verified: true });
    }
    return HttpResponse.json({ message: "Código inválido" }, { status: 400 });
  }),

  // Top-ups
  http.post(`${API_BASE_URL}/api/v1/wallets/:walletId/topup`, async ({ request }) => {
    const body = (await request.json()) as { amount: number; method: string };
    return HttpResponse.json({
      topUpId: "topup-new",
      amount: body.amount,
      status: "COMPLETED",
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/wallets/:walletId/topup/cash`, async ({ request }) => {
    const body = (await request.json()) as { amount: number };
    return HttpResponse.json(
      {
        topUpId: "topup-cash-new",
        referenceNumber: "REF-12345678",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: "PENDING",
      },
      { status: 201 }
    );
  }),

  // P2P Transfers
  http.post(`${API_BASE_URL}/api/v1/p2p/transfers`, async ({ request }) => {
    const body = (await request.json()) as {
      recipientEmail?: string;
      recipientPhone?: string;
      amount: number;
    };
    return HttpResponse.json(
      {
        transferId: "transfer-new",
        recipientName: "Carlos M.",
        amount: body.amount,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/p2p/transfers`, () => {
    return HttpResponse.json({
      content: [],
      pagination: {
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      },
    });
  }),

  // QR Payments
  http.post(`${API_BASE_URL}/api/v1/qr/generate`, async ({ request }) => {
    const body = (await request.json()) as { amount?: number };
    return HttpResponse.json(
      {
        qrId: "qr-new",
        qrData: "base64-qr-code",
        qrUrl: "https://qr.example.com/qr-new",
        expiresAt: new Date(Date.now() + 900000).toISOString(),
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE_URL}/api/v1/qr/pay`, async ({ request }) => {
    const body = (await request.json()) as { amount?: number };
    return HttpResponse.json(
      {
        paymentId: "qr-payment-new",
        amount: body.amount || 0,
        recipient: "Recipient Name",
        status: "COMPLETED",
      },
      { status: 201 }
    );
  }),

  // Bill Payments
  http.post(`${API_BASE_URL}/api/v1/bills/pay`, async ({ request }) => {
    const body = (await request.json()) as {
      billerCode: string;
      referenceNumber: string;
      amount: number;
    };
    return HttpResponse.json(
      {
        billPaymentId: "bill-new",
        billerCode: body.billerCode,
        referenceNumber: body.referenceNumber,
        amount: body.amount,
        status: "PROCESSING",
      },
      { status: 202 }
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/bills/favorites`, () => {
    return HttpResponse.json({
      favorites: [],
    });
  }),

  // Notifications
  http.get(`${API_BASE_URL}/api/v1/notifications`, () => {
    return HttpResponse.json({
      content: [],
      unreadCount: 0,
      pagination: {
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0,
      },
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/notifications/read-all`, () => {
    return HttpResponse.json({ markedCount: 0 });
  }),

  // Notification Preferences
  http.get(`${API_BASE_URL}/api/v1/notifications/preferences`, () => {
    return HttpResponse.json({
      preferences: [
        { type: "TOPUP_COMPLETED", push: true, email: true, sms: false },
        { type: "P2P_RECEIVED", push: true, email: true, sms: false },
        { type: "BILL_PAID", push: true, email: true, sms: false },
        { type: "SECURITY_ALERT", push: true, email: true, sms: true },
      ],
    });
  }),

  http.put(`${API_BASE_URL}/api/v1/notifications/preferences`, async ({ request }) => {
    const body = (await request.json()) as { preferences: any[] };
    return HttpResponse.json({ updated: body.preferences });
  }),

  // Security
  http.post(`${API_BASE_URL}/api/v1/security/2fa/enable`, () => {
    return HttpResponse.json({
      secret: "JBSWY3DPEHPK3PXP",
      provisioningUri:
        "otpauth://totp/Ledger%20Engine:user@test.com?secret=JBSWY3DPEHPK3PXP&issuer=Ledger%20Engine",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?data=otpauth...",
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/security/2fa/verify`, async ({ request }) => {
    const body = (await request.json()) as { code: string };
    if (body.code === "123456") {
      return HttpResponse.json({
        enabled: true,
        backupCodes: [
          "ABC1-DEF2",
          "GHI3-JKL4",
          "MNO5-PQR6",
          "STU7-VWX8",
          "YZA9-BCD1",
          "EFG2-HIJ3",
          "KLM4-NOP5",
          "QRS6-TUV7",
          "WXY8-ZAB9",
          "CDE1-FGH2",
        ],
      });
    }
    return HttpResponse.json({ message: "Código inválido" }, { status: 400 });
  }),

  http.post(`${API_BASE_URL}/api/v1/security/2fa/disable`, async ({ request }) => {
    const body = (await request.json()) as { code: string };
    if (body.code === "123456") {
      return HttpResponse.json({ enabled: false });
    }
    return HttpResponse.json({ message: "Código inválido" }, { status: 400 });
  }),

  http.get(`${API_BASE_URL}/api/v1/security/devices`, () => {
    return HttpResponse.json({
      devices: [
        {
          deviceId: "device-1",
          name: "Chrome on Windows",
          os: "Windows",
          browser: "Chrome",
          lastLoginAt: new Date().toISOString(),
          isCurrentDevice: true,
          trusted: true,
        },
      ],
    });
  }),

  // KYC
  http.get(`${API_BASE_URL}/api/v1/kyc/status`, () => {
    return HttpResponse.json({
      status: "PENDING",
      submittedAt: null,
      reviewedAt: null,
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/kyc/submit`, () => {
    return HttpResponse.json(
      {
        kycId: "kyc-new",
        status: "UNDER_REVIEW",
        submittedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),
];
