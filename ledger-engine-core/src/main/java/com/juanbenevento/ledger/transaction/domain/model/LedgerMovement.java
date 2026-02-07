package com.juanbenevento.ledger.transaction.domain.model;

import com.juanbenevento.ledger.common.domain.model.Currency;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record LedgerMovement(
        UUID transactionId,
        String correlationId,
        LocalDateTime bookedAt,
        String createdBy,
        JournalEntryType type,
        BigDecimal amount,
        Currency currency
) {
}
