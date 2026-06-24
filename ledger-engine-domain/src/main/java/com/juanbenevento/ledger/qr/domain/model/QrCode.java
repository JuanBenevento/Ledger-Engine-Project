package com.juanbenevento.ledger.qr.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * QR Code aggregate root.
 * Represents a scannable QR code for payment collection.
 * Lifecycle: ACTIVE → EXPIRED | USED (single-use invalidation).
 */
public class QrCode {

    private final UUID id;
    private final UUID walletId;
    private final UUID userId;
    private final QrType type;
    private final BigDecimal amount;       // null for FIXED (user enters at scan)
    private final String currency;
    private final String description;
    private final String hmacPayload;     // signed payload for integrity
    private final int ttlSeconds;
    private final LocalDateTime createdAt;
    private final LocalDateTime expiresAt;
    private QrCodeStatus status;
    private UUID paidByTransactionId;     // set when QR is used
    private LocalDateTime paidAt;
    private Long version;

    private QrCode(UUID id, UUID walletId, UUID userId, QrType type,
                   BigDecimal amount, String currency, String description,
                   String hmacPayload, int ttlSeconds, LocalDateTime createdAt) {
        this.id = Objects.requireNonNull(id, "QR Code ID must not be null");
        this.walletId = Objects.requireNonNull(walletId, "Wallet ID must not be null");
        this.userId = Objects.requireNonNull(userId, "User ID must not be null");
        this.type = Objects.requireNonNull(type, "QR type must not be null");
        this.amount = validateAmount(type, amount);
        this.currency = Objects.requireNonNull(currency, "Currency must not be null");
        this.description = description;
        this.hmacPayload = Objects.requireNonNull(hmacPayload, "HMAC payload must not be null");
        this.ttlSeconds = ttlSeconds;
        this.createdAt = createdAt;
        this.expiresAt = createdAt.plusSeconds(ttlSeconds);
        this.status = QrCodeStatus.ACTIVE;
        this.version = 0L;
    }

    public static QrCode create(UUID id, UUID walletId, UUID userId, QrType type,
                                BigDecimal amount, String currency, String description,
                                String hmacPayload, int ttlSeconds) {
        return new QrCode(id, walletId, userId, type, amount, currency, description, hmacPayload, ttlSeconds, LocalDateTime.now());
    }

    public static QrCode reconstitute(UUID id, UUID walletId, UUID userId, QrType type,
                                      BigDecimal amount, String currency, String description,
                                      String hmacPayload, int ttlSeconds, QrCodeStatus status,
                                      UUID paidByTransactionId, LocalDateTime paidAt,
                                      LocalDateTime createdAt, Long version) {
        QrCode qrCode = new QrCode(id, walletId, userId, type, amount, currency, description, hmacPayload, ttlSeconds, createdAt);
        qrCode.status = status;
        qrCode.paidByTransactionId = paidByTransactionId;
        qrCode.paidAt = paidAt;
        qrCode.version = version;
        return qrCode;
    }

    // --- Status transitions ---

    public void markAsPaid(UUID transactionId) {
        ensureStatus(QrCodeStatus.ACTIVE, "mark as paid");
        if (isExpired()) {
            this.status = QrCodeStatus.EXPIRED;
            throw new IllegalStateException("QR Code has expired");
        }
        this.status = QrCodeStatus.USED;
        this.paidByTransactionId = transactionId;
        this.paidAt = LocalDateTime.now();
    }

    public void expire() {
        ensureStatus(QrCodeStatus.ACTIVE, "expire");
        this.status = QrCodeStatus.EXPIRED;
    }

    // --- Queries ---

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isValidForPayment() {
        return this.status == QrCodeStatus.ACTIVE && !isExpired();
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getWalletId() { return walletId; }
    public UUID getUserId() { return userId; }
    public QrType getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getDescription() { return description; }
    public String getHmacPayload() { return hmacPayload; }
    public int getTtlSeconds() { return ttlSeconds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public QrCodeStatus getStatus() { return status; }
    public UUID getPaidByTransactionId() { return paidByTransactionId; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public Long getVersion() { return version; }

    // --- Private helpers ---

    private void ensureStatus(QrCodeStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "Cannot " + action + " QR Code from status: " + this.status + ". Expected " + expected + ".");
        }
    }

    private BigDecimal validateAmount(QrType type, BigDecimal amount) {
        if (type == QrType.DYNAMIC) {
            Objects.requireNonNull(amount, "Amount is required for DYNAMIC QR codes");
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Amount must be positive for DYNAMIC QR codes");
            }
        }
        return amount;
    }
}
