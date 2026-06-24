package com.juanbenevento.ledger.topup.application.port.input;

import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Use case for initiating and confirming cash point top-ups.
 * Flow: create top-up → generate reference code → user pays at cash point → confirm within 24h.
 */
public interface CashTopUpUseCase {
    TopUpResponse initiate(CashTopUpCommand command);
    TopUpResponse confirm(UUID topUpId);

    record CashTopUpCommand(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            String currency,
            String correlationId
    ) {}
}
