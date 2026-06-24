package com.juanbenevento.ledger.qr.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PayQrRequest(
        UUID qrCodeId,
        UUID payerWalletId,
        UUID payerUserId,
        BigDecimal amount,     // required for FIXED QR, should match for DYNAMIC
        String hmacPayload     // the signed payload from the QR code
) {
}
