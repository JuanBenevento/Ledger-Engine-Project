package com.juanbenevento.ledger.qr.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QrCodeTest {

    private static final UUID WALLET_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Test
    @DisplayName("US-17: Should create a FIXED QR code without amount")
    void shouldCreateFixedQrCode() {
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test QR", "hmac-signature-123", 3600
        );

        assertThat(qrCode).isNotNull();
        assertThat(qrCode.getType()).isEqualTo(QrType.FIXED);
        assertThat(qrCode.getAmount()).isNull();
        assertThat(qrCode.getStatus()).isEqualTo(QrCodeStatus.ACTIVE);
        assertThat(qrCode.getCurrency()).isEqualTo("COP");
        assertThat(qrCode.getTtlSeconds()).isEqualTo(3600);
        assertThat(qrCode.getExpiresAt()).isAfter(qrCode.getCreatedAt());
    }

    @Test
    @DisplayName("US-17: Should create a DYNAMIC QR code with amount")
    void shouldCreateDynamicQrCode() {
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.DYNAMIC,
                new BigDecimal("50000.00"), "COP", "Payment for service", "hmac-signature-456", 1800
        );

        assertThat(qrCode).isNotNull();
        assertThat(qrCode.getType()).isEqualTo(QrType.DYNAMIC);
        assertThat(qrCode.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(qrCode.getStatus()).isEqualTo(QrCodeStatus.ACTIVE);
    }

    @Test
    @DisplayName("US-17: Should reject DYNAMIC QR code without amount")
    void shouldRejectDynamicQrCodeWithoutAmount() {
        assertThatThrownBy(() -> QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.DYNAMIC,
                null, "COP", "Test", "hmac", 3600
        )).isInstanceOf(NullPointerException.class)
          .hasMessageContaining("Amount is required");
    }

    @Test
    @DisplayName("US-17: Should reject DYNAMIC QR code with zero/negative amount")
    void shouldRejectDynamicQrCodeWithInvalidAmount() {
        assertThatThrownBy(() -> QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.DYNAMIC,
                BigDecimal.ZERO, "COP", "Test", "hmac", 3600
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("Amount must be positive");

        assertThatThrownBy(() -> QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.DYNAMIC,
                new BigDecimal("-100"), "COP", "Test", "hmac", 3600
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("Amount must be positive");
    }

    @Test
    @DisplayName("US-17: Should mark QR code as paid")
    void shouldMarkQrCodeAsPaid() {
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test", "hmac", 3600
        );
        UUID transactionId = UUID.randomUUID();

        qrCode.markAsPaid(transactionId);

        assertThat(qrCode.getStatus()).isEqualTo(QrCodeStatus.USED);
        assertThat(qrCode.getPaidByTransactionId()).isEqualTo(transactionId);
        assertThat(qrCode.getPaidAt()).isNotNull();
    }

    @Test
    @DisplayName("US-17: Should not allow paying an already USED QR code")
    void shouldNotAllowPayingUsedQrCode() {
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test", "hmac", 3600
        );
        qrCode.markAsPaid(UUID.randomUUID());

        assertThatThrownBy(() -> qrCode.markAsPaid(UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot mark as paid")
                .hasMessageContaining("USED");
    }

    @Test
    @DisplayName("US-17: Should expire QR code")
    void shouldExpireQrCode() {
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test", "hmac", 3600
        );

        qrCode.expire();

        assertThat(qrCode.getStatus()).isEqualTo(QrCodeStatus.EXPIRED);
    }

    @Test
    @DisplayName("US-17: Should report expired based on TTL")
    void shouldReportExpiredBasedOnTtl() {
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test", "hmac", 1  // 1 second TTL
        );

        assertThat(qrCode.isValidForPayment()).isTrue();

        // Simulate expiration by reconstituting with past time
        QrCode expired = QrCode.reconstitute(
                qrCode.getId(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test", "hmac", 1, QrCodeStatus.ACTIVE,
                null, null, LocalDateTime.now().minusSeconds(10), 0L
        );

        assertThat(expired.isExpired()).isTrue();
        assertThat(expired.isValidForPayment()).isFalse();
    }

    @Test
    @DisplayName("US-17: Should reject null wallet ID")
    void shouldRejectNullWalletId() {
        assertThatThrownBy(() -> QrCode.create(
                UUID.randomUUID(), null, USER_ID, QrType.FIXED,
                null, "COP", "Test", "hmac", 3600
        )).isInstanceOf(NullPointerException.class)
          .hasMessageContaining("Wallet ID");
    }

    @Test
    @DisplayName("US-17: Should reject null HMAC payload")
    void shouldRejectNullHmacPayload() {
        assertThatThrownBy(() -> QrCode.create(
                UUID.randomUUID(), WALLET_ID, USER_ID, QrType.FIXED,
                null, "COP", "Test", null, 3600
        )).isInstanceOf(NullPointerException.class)
          .hasMessageContaining("HMAC payload");
    }
}
