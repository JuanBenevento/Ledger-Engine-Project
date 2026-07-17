package com.juanbenevento.ledger.p2p.domain.model;

import com.juanbenevento.ledger.p2p.domain.event.P2pTransferCompletedEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * P2P Transfer aggregate root.
 * Represents a peer-to-peer money transfer between wallets.
 * Follows lifecycle: PENDING → PROCESSING → COMPLETED | FAILED.
 */
public class P2pTransfer {

    private final UUID id;
    private final UUID senderWalletId;
    private final UUID senderUserId;
    private final UUID recipientWalletId;
    private final UUID recipientUserId;
    private final BigDecimal amount;
    private final String currency;
    private final String note;
    private final String correlationId;
    private P2pTransferStatus status;
    private String failureReason;
    private final LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long version;

    private P2pTransfer(UUID id, UUID senderWalletId, UUID senderUserId,
                        UUID recipientWalletId, UUID recipientUserId,
                        BigDecimal amount, String currency, String note, String correlationId) {
        this.id = Objects.requireNonNull(id, "P2P transfer ID must not be null");
        this.senderWalletId = Objects.requireNonNull(senderWalletId, "Sender wallet ID must not be null");
        this.senderUserId = Objects.requireNonNull(senderUserId, "Sender user ID must not be null");
        this.recipientWalletId = Objects.requireNonNull(recipientWalletId, "Recipient wallet ID must not be null");
        this.recipientUserId = Objects.requireNonNull(recipientUserId, "Recipient user ID must not be null");
        this.amount = validateAmount(amount);
        this.currency = Objects.requireNonNull(currency, "Currency must not be null");
        this.note = note;
        this.correlationId = Objects.requireNonNull(correlationId, "Correlation ID must not be null");
        this.status = P2pTransferStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.version = 0L;

        if (senderWalletId.equals(recipientWalletId)) {
            throw new IllegalArgumentException("Sender and recipient wallets must be different");
        }
    }

    public static P2pTransfer create(UUID id, UUID senderWalletId, UUID senderUserId,
                                     UUID recipientWalletId, UUID recipientUserId,
                                     BigDecimal amount, String currency, String note,
                                     String correlationId) {
        return new P2pTransfer(id, senderWalletId, senderUserId,
                recipientWalletId, recipientUserId, amount, currency, note, correlationId);
    }

    public static P2pTransfer reconstitute(UUID id, UUID senderWalletId, UUID senderUserId,
                                           UUID recipientWalletId, UUID recipientUserId,
                                           BigDecimal amount, String currency, String note,
                                           String correlationId, P2pTransferStatus status,
                                           String failureReason, LocalDateTime createdAt,
                                           LocalDateTime completedAt, Long version) {
        P2pTransfer transfer = new P2pTransfer(id, senderWalletId, senderUserId,
                recipientWalletId, recipientUserId, amount, currency, note, correlationId);
        transfer.status = status;
        transfer.failureReason = failureReason;
        transfer.completedAt = completedAt;
        transfer.version = version;
        return transfer;
    }

    // --- Status transitions ---

    public void startProcessing() {
        ensureStatus(P2pTransferStatus.PENDING, "start processing");
        this.status = P2pTransferStatus.PROCESSING;
    }

    public P2pTransferCompletedEvent complete() {
        ensureStatus(P2pTransferStatus.PROCESSING, "complete");
        this.status = P2pTransferStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        return P2pTransferCompletedEvent.of(this.id, this.senderWalletId, this.recipientWalletId,
                this.amount, this.currency);
    }

    public void fail(String reason) {
        ensureStatus(P2pTransferStatus.PROCESSING, "fail");
        this.status = P2pTransferStatus.FAILED;
        this.failureReason = reason;
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getSenderWalletId() { return senderWalletId; }
    public UUID getSenderUserId() { return senderUserId; }
    public UUID getRecipientWalletId() { return recipientWalletId; }
    public UUID getRecipientUserId() { return recipientUserId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getNote() { return note; }
    public String getCorrelationId() { return correlationId; }
    public P2pTransferStatus getStatus() { return status; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public Long getVersion() { return version; }

    // --- Private helpers ---

    private void ensureStatus(P2pTransferStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "Cannot " + action + " P2P transfer from status: " + this.status + ". Expected " + expected + ".");
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
