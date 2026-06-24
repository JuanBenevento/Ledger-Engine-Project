package com.juanbenevento.ledger.topup.domain.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event emitted when a top-up operation is completed successfully.
 * Triggers wallet balance update and notification.
 */
public record TopUpCompletedEvent(
        UUID topUpId,
        UUID walletId,
        UUID userId,
        BigDecimal amount,
        String currency,
        LocalDateTime occurredAt
) {
    public static TopUpCompletedEvent of(UUID topUpId, UUID walletId, UUID userId,
                                         BigDecimal amount, String currency) {
        return new TopUpCompletedEvent(topUpId, walletId, userId, amount, currency, LocalDateTime.now());
    }
}
