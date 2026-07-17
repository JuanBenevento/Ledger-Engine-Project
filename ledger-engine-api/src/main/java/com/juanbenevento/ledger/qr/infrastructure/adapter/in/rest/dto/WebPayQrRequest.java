package com.juanbenevento.ledger.qr.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record WebPayQrRequest(
        @Schema(description = "QR Code ID to pay")
        @NotNull UUID qrCodeId,

        @Schema(description = "Payer's wallet ID")
        @NotNull UUID payerWalletId,

        @Schema(description = "Payer's user ID")
        @NotNull UUID payerUserId,

        @Schema(example = "25000.00", description = "Payment amount (required for FIXED QR)")
        BigDecimal amount,

        @Schema(description = "HMAC signature from the QR code")
        @NotNull String hmacPayload
) {
}
