package com.juanbenevento.ledger.qr.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record GenerateQrRequest(
        UUID walletId,
        UUID userId,
        String type,           // FIXED or DYNAMIC
        BigDecimal amount,     // required for DYNAMIC, null for FIXED
        String currency,
        String description,
        int ttlSeconds
) {
}
