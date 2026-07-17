package com.juanbenevento.ledger.transaction.application.port.in;

import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface DepositUseCase {
    TransactionResponse execute(DepositCommand command);

    record DepositCommand(
            UUID targetAccountId,
            BigDecimal amount,
            String currency,
            String description,
            String correlationId
    ) {}
}