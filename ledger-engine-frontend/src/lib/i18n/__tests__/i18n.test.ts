import { describe, it, expect } from "vitest";
import esMessages from "../../../../messages/es.json";
import { routing } from "../routing";

describe("i18n configuration", () => {
  describe("messages/es.json", () => {
    it("contains navigation namespace with all sidebar items", () => {
      expect(esMessages).toHaveProperty("Navigation");
      const nav = (esMessages as Record<string, unknown>).Navigation as Record<
        string,
        string
      >;
      expect(nav.dashboard).toBe("Dashboard");
      expect(nav.wallets).toBe("Billeteras");
      expect(nav.topup).toBe("Recargar");
      expect(nav.transfer).toBe("Transferir");
      expect(nav.qr).toBe("Código QR");
      expect(nav.bills).toBe("Pagar servicios");
      expect(nav.notifications).toBe("Notificaciones");
      expect(nav.security).toBe("Seguridad");
      expect(nav.kyc).toBe("Verificación");
    });

    it("contains error namespace with boundary strings", () => {
      const error = (esMessages as Record<string, unknown>).Error as Record<
        string,
        string
      >;
      expect(error.somethingWentWrong).toBe("Algo salió mal");
      expect(error.retry).toBe("Reintentar");
      expect(error.unexpectedMessage).toContain("error inesperado");
    });

    it("contains auth namespace with login strings", () => {
      const auth = (esMessages as Record<string, unknown>).Auth as Record<
        string,
        Record<string, string>
      >;
      expect(auth.login.title).toBe("Iniciar sesión");
      expect(auth.login.incorrectCredentials).toBe("Credenciales incorrectas");
      expect(auth.login.forgotPassword).toContain("contraseña");
      expect(auth.login.emailLabel).toBe("Correo electrónico");
      expect(auth.login.passwordLabel).toBe("Contraseña");
      expect(auth.login.submit).toBe("Iniciar sesión");
      expect(auth.login.noAccount).toContain("cuenta");
      expect(auth.login.createAccount).toBe("Crear cuenta");
    });

    it("contains wallet namespace with dashboard strings", () => {
      const wallet = (esMessages as Record<string, unknown>).Wallet as Record<
        string,
        Record<string, string>
      >;
      expect(wallet.dashboard.title).toBe("Mis Billeteras");
      expect(wallet.dashboard.totalBalance).toBe("Saldo total");
      expect(wallet.dashboard.emptyTitle).toContain("billeteras");
      expect(wallet.create.title).toBe("Crear nueva billetera");
      expect(wallet.create.button).toBe("Nueva billetera");
      expect(wallet.create.nameLabel).toBe("Nombre de la billetera");
      expect(wallet.create.creating).toBe("Creando...");
      expect(wallet.create.submit).toBe("Crear billetera");
    });

    it("contains topup namespace with card and cash strings", () => {
      const topup = (esMessages as Record<string, unknown>).TopUp as Record<
        string,
        Record<string, string>
      >;
      expect(topup.card.title).toBe("Datos de la tarjeta");
      expect(topup.card.cardNumberLabel).toBe("Número de tarjeta");
      expect(topup.card.expiryLabel).toBe("Fecha de expiración");
      expect(topup.card.amountLabel).toBe("Monto a recargar");
      expect(topup.card.reloading).toBe("Recargando...");
      expect(topup.card.submit).toBe("Recargar");
      expect(topup.success).toBe("Recarga exitosa");
    });

    it("contains transfer namespace with confirmation strings", () => {
      const transfer = (esMessages as Record<string, unknown>).Transfer as Record<
        string,
        Record<string, string>
      >;
      expect(transfer.confirm.title).toBe("Confirmar transferencia");
      expect(transfer.confirm.description).toContain("detalles");
      expect(transfer.confirm.recipient).toBe("Destinatario");
      expect(transfer.confirm.amount).toBe("Monto");
      expect(transfer.confirm.descriptionLabel).toBe("Descripción");
      expect(transfer.confirm.duplicateWarning).toContain("reciente");
      expect(transfer.confirm.submit).toBe("Confirmar");
      expect(transfer.confirm.sending).toBe("Enviando...");
      expect(transfer.confirm.cancel).toBe("Cancelar");
    });

    it("contains QR namespace with generate strings", () => {
      const qr = (esMessages as Record<string, unknown>).QR as Record<
        string,
        Record<string, string>
      >;
      expect(qr.generate.title).toBe("Generar código QR");
      expect(qr.generate.description).toContain("recibir pagos");
      expect(qr.generate.submit).toBe("Generar QR");
      expect(qr.generate.generating).toBe("Generando...");
      expect(qr.generate.openAmountHint).toContain("monto abierto");
    });

    it("contains notification namespace with mark all read", () => {
      const notif = (esMessages as Record<string, unknown>).Notifications as Record<
        string,
        string
      >;
      expect(notif.markAllRead).toBe("Marcar todo leído");
    });

    it("contains status namespace with all status badges", () => {
      const status = (esMessages as Record<string, unknown>).Status as Record<
        string,
        string
      >;
      expect(status.COMPLETED).toBe("COMPLETED");
      expect(status.PENDING).toBe("PENDING");
      expect(status.FAILED).toBe("FAILED");
      expect(status.PROCESSING).toBe("PROCESSING");
    });

    it("contains all required top-level namespaces", () => {
      const requiredNamespaces = [
        "Navigation",
        "Error",
        "Auth",
        "Wallet",
        "TopUp",
        "Transfer",
        "QR",
        "Notifications",
        "Status",
        "Common",
      ];
      for (const ns of requiredNamespaces) {
        expect(esMessages).toHaveProperty(ns);
      }
    });

    it("contains common namespace with shared UI strings", () => {
      const common = (esMessages as Record<string, unknown>).Common as Record<
        string,
        string
      >;
      expect(common.cancel).toBe("Cancelar");
      expect(common.confirm).toBe("Confirmar");
      expect(common.loading).toContain("Cargando");
    });
  });

  describe("routing configuration", () => {
    it("has es as the only supported locale", () => {
      expect(routing.locales).toEqual(["es"]);
    });

    it("has es as the default locale", () => {
      expect(routing.defaultLocale).toBe("es");
    });
  });
});
