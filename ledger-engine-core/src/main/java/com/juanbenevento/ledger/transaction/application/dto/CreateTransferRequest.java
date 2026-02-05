package com.juanbenevento.ledger.transaction.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateTransferRequest(
        UUID sourceAccountId,
        UUID targetAccountId,
        BigDecimal amount,
        String currency,
        String description,
        String correlationId,
        String createdBy
) { }
