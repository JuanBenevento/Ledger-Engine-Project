package com.juanbenevento.ledger.billpay.application.port.input;

import com.juanbenevento.ledger.billpay.application.dto.BillPaymentResponse;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Use case for paying a bill.
 * Wraps the existing TransferUseCase for double-entry ledger mechanics.
 */
public interface PayBillUseCase {
    BillPaymentResponse execute(PayBillCommand command);

    record PayBillCommand(
            UUID walletId,
            UUID userId,
            UUID billerId,
            BigDecimal amount,
            String currency,
            String reference,
            String correlationId
    ) {}
}
