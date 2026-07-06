package com.juanbenevento.ledger.billpay.domain.model;

import com.juanbenevento.ledger.billpay.domain.event.BillPaymentCompletedEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Bill Payment aggregate root.
 * Represents a payment made to a biller (utility, service provider, etc.).
 * Lifecycle: PENDING → PROCESSING → COMPLETED | FAILED.
 */
public class BillPayment {

    private final UUID id;
    private final UUID walletId;
    private final UUID billerId;
    private final BigDecimal amount;
    private final String currency;
    private final String reference;
    private final String correlationId;
    private BillPaymentStatus status;
    private String providerResponse;
    private final LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long version;

    private BillPayment(UUID id, UUID walletId, UUID billerId, BigDecimal amount,
                        String currency, String reference, String correlationId) {
        this.id = Objects.requireNonNull(id, "Bill payment ID must not be null");
        this.walletId = Objects.requireNonNull(walletId, "Wallet ID must not be null");
        this.billerId = Objects.requireNonNull(billerId, "Biller ID must not be null");
        this.amount = validateAmount(amount);
        this.currency = Objects.requireNonNull(currency, "Currency must not be null");
        this.reference = Objects.requireNonNull(reference, "Reference must not be null");
        this.correlationId = Objects.requireNonNull(correlationId, "Correlation ID must not be null");
        this.status = BillPaymentStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.version = 0L;
    }

    public static BillPayment create(UUID id, UUID walletId, UUID billerId, BigDecimal amount,
                                     String currency, String reference, String correlationId) {
        return new BillPayment(id, walletId, billerId, amount, currency, reference, correlationId);
    }

    public static BillPayment reconstitute(UUID id, UUID walletId, UUID billerId, BigDecimal amount,
                                           String currency, String reference, String correlationId,
                                           BillPaymentStatus status, String providerResponse,
                                           LocalDateTime createdAt, LocalDateTime completedAt, Long version) {
        BillPayment payment = new BillPayment(id, walletId, billerId, amount, currency, reference, correlationId);
        payment.status = status;
        payment.providerResponse = providerResponse;
        payment.completedAt = completedAt;
        payment.version = version;
        return payment;
    }

    // --- Status transitions ---

    public void startProcessing() {
        ensureStatus(BillPaymentStatus.PENDING, "start processing");
        this.status = BillPaymentStatus.PROCESSING;
    }

    public BillPaymentCompletedEvent complete(String providerResponse) {
        ensureStatus(BillPaymentStatus.PROCESSING, "complete");
        this.status = BillPaymentStatus.COMPLETED;
        this.providerResponse = providerResponse;
        this.completedAt = LocalDateTime.now();
        return BillPaymentCompletedEvent.of(this.id, this.walletId, this.billerId,
                this.amount, this.currency, this.reference);
    }

    public void fail(String reason) {
        ensureStatus(BillPaymentStatus.PROCESSING, "fail");
        this.status = BillPaymentStatus.FAILED;
        this.providerResponse = reason;
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getWalletId() { return walletId; }
    public UUID getBillerId() { return billerId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getReference() { return reference; }
    public String getCorrelationId() { return correlationId; }
    public BillPaymentStatus getStatus() { return status; }
    public String getProviderResponse() { return providerResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public Long getVersion() { return version; }

    // --- Private helpers ---

    private void ensureStatus(BillPaymentStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "Cannot " + action + " bill payment from status: " + this.status + ". Expected " + expected + ".");
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
