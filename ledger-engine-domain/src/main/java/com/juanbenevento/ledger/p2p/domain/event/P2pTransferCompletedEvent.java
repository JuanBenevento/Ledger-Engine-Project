package com.juanbenevento.ledger.p2p.domain.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event emitted when a P2P transfer is completed successfully.
 */
public record P2pTransferCompletedEvent(
        UUID transferId,
        UUID senderWalletId,
        UUID recipientWalletId,
        BigDecimal amount,
        String currency,
        LocalDateTime occurredAt
) {
    public static P2pTransferCompletedEvent of(UUID transferId, UUID senderWalletId,
                                               UUID recipientWalletId, BigDecimal amount,
                                               String currency) {
        return new P2pTransferCompletedEvent(transferId, senderWalletId, recipientWalletId,
                amount, currency, LocalDateTime.now());
    }
}
