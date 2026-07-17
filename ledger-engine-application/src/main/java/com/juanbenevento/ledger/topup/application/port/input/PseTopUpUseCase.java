package com.juanbenevento.ledger.topup.application.port.input;

import com.juanbenevento.ledger.topup.application.dto.PseTopUpResponse;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Use case for initiating PSE (Pago Seguro Electrónico) top-ups.
 * Async flow: create top-up → generate redirect URL → user completes on bank site → webhook callback.
 */
public interface PseTopUpUseCase {
    PseTopUpResponse initiate(PseTopUpCommand command);
    void confirmCallback(String externalReference, boolean success, String failureReason);

    record PseTopUpCommand(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            String currency,
            String bankCode,
            String personType,
            String documentType,
            String documentNumber,
            String correlationId
    ) {}
}
