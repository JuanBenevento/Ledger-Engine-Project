package com.juanbenevento.ledger.topup.domain.model;

import com.juanbenevento.ledger.topup.domain.event.TopUpCompletedEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * TopUp aggregate root.
 * Represents a top-up operation that credits funds into a wallet.
 * Follows lifecycle: PENDING → PROCESSING → COMPLETED | FAILED | EXPIRED.
 */
public class TopUp {

    private final UUID id;
    private final UUID walletId;
    private final UUID userId;
    private final BigDecimal amount;
    private final String currency;
    private final TopUpMethod method;
    private TopUpStatus status;
    private String externalReference;
    private String failureReason;
    private String referenceCode;
    private LocalDateTime expiresAt;
    private final LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long version;

    private TopUp(UUID id, UUID walletId, UUID userId, BigDecimal amount,
                  String currency, TopUpMethod method) {
        this.id = Objects.requireNonNull(id, "TopUp ID must not be null");
        this.walletId = Objects.requireNonNull(walletId, "Wallet ID must not be null");
        this.userId = Objects.requireNonNull(userId, "User ID must not be null");
        this.amount = validateAmount(amount);
        this.currency = Objects.requireNonNull(currency, "Currency must not be null");
        this.method = Objects.requireNonNull(method, "TopUp method must not be null");
        this.status = TopUpStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.version = 0L;
    }

    public static TopUp create(UUID id, UUID walletId, UUID userId, BigDecimal amount,
                               String currency, TopUpMethod method) {
        return new TopUp(id, walletId, userId, amount, currency, method);
    }

    public static TopUp reconstitute(UUID id, UUID walletId, UUID userId, BigDecimal amount,
                                     String currency, TopUpMethod method, TopUpStatus status,
                                     String externalReference, String failureReason,
                                     String referenceCode, LocalDateTime expiresAt,
                                     LocalDateTime createdAt, LocalDateTime completedAt,
                                     Long version) {
        TopUp topUp = new TopUp(id, walletId, userId, amount, currency, method);
        topUp.status = status;
        topUp.externalReference = externalReference;
        topUp.failureReason = failureReason;
        topUp.referenceCode = referenceCode;
        topUp.expiresAt = expiresAt;
        topUp.completedAt = completedAt;
        topUp.version = version;
        return topUp;
    }

    // --- Status transitions ---

    public void startProcessing() {
        ensureStatus(TopUpStatus.PENDING, "start processing");
        this.status = TopUpStatus.PROCESSING;
    }

    public TopUpCompletedEvent complete(String externalReference) {
        ensureStatus(TopUpStatus.PROCESSING, "complete");
        this.status = TopUpStatus.COMPLETED;
        this.externalReference = externalReference;
        this.completedAt = LocalDateTime.now();
        return TopUpCompletedEvent.of(this.id, this.walletId, this.userId,
                this.amount, this.currency);
    }

    public void fail(String reason) {
        ensureStatus(TopUpStatus.PROCESSING, "fail");
        this.status = TopUpStatus.FAILED;
        this.failureReason = reason;
    }

    public void expire() {
        if (this.status == TopUpStatus.PENDING || this.status == TopUpStatus.PROCESSING) {
            this.status = TopUpStatus.EXPIRED;
        }
    }

    // --- Setters for infrastructure ---

    public void setExternalReference(String externalReference) {
        this.externalReference = externalReference;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getWalletId() { return walletId; }
    public UUID getUserId() { return userId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public TopUpMethod getMethod() { return method; }
    public TopUpStatus getStatus() { return status; }
    public String getExternalReference() { return externalReference; }
    public String getFailureReason() { return failureReason; }
    public String getReferenceCode() { return referenceCode; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public Long getVersion() { return version; }

    // --- Private helpers ---

    private void ensureStatus(TopUpStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "Cannot " + action + " top-up from status: " + this.status + ". Expected " + expected + ".");
        }
    }

    private BigDecimal validateAmount(BigDecimal amount) {
        Objects.requireNonNull(amount, "Amount must not be null");
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        return amount;
    }
}
