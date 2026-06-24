package com.juanbenevento.ledger.qr.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PayQrResponse(
        UUID transactionId,
        UUID qrCodeId,
        BigDecimal amount,
        String currency,
        UUID senderWalletId,
        UUID recipientWalletId,
        LocalDateTime paidAt
) {
}
