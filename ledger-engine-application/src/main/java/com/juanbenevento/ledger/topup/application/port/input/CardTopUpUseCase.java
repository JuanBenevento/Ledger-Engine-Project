package com.juanbenevento.ledger.topup.application.port.input;

import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Use case for processing card-based top-ups.
 * Synchronous flow: charge card → credit wallet → record transaction.
 */
public interface CardTopUpUseCase {
    TopUpResponse execute(CardTopUpCommand command);

    record CardTopUpCommand(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            String currency,
            String cardToken,
            String correlationId
    ) {}
}
