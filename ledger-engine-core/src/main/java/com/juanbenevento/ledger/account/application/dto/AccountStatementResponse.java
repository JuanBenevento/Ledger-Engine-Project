package com.juanbenevento.ledger.account.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountStatementResponse(
        UUID transactionId,
        String correlationId,
        String type,
        BigDecimal amount,
        BigDecimal runningBalance,
        LocalDateTime bookedAt,
        String createdBy
) {
}
