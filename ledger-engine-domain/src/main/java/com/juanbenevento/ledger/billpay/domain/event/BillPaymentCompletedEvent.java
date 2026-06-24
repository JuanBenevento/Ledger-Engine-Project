package com.juanbenevento.ledger.billpay.domain.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event emitted when a bill payment is completed successfully.
 */
public record BillPaymentCompletedEvent(
        UUID paymentId,
        UUID walletId,
        UUID billerId,
        BigDecimal amount,
        String currency,
        String reference,
        LocalDateTime occurredAt
) {
    public static BillPaymentCompletedEvent of(UUID paymentId, UUID walletId, UUID billerId,
                                               BigDecimal amount, String currency, String reference) {
        return new BillPaymentCompletedEvent(paymentId, walletId, billerId,
                amount, currency, reference, LocalDateTime.now());
    }
}
