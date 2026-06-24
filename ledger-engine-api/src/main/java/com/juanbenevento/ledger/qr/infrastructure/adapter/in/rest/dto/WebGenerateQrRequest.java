package com.juanbenevento.ledger.qr.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;

public record WebGenerateQrRequest(
        @Schema(description = "Wallet ID that will receive the payment")
        @NotNull UUID walletId,

        @Schema(description = "User ID who owns the wallet")
        @NotNull UUID userId,

        @Schema(example = "FIXED", description = "QR type: FIXED (user enters amount) or DYNAMIC (amount embedded)")
        @NotBlank @Pattern(regexp = "^(FIXED|DYNAMIC)$")
        String type,

        @Schema(example = "50000.00", description = "Amount (required for DYNAMIC, null for FIXED)")
        BigDecimal amount,

        @Schema(example = "COP", description = "ISO-4217 currency code")
        @NotBlank @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @Schema(example = "Payment for coffee", description = "Optional description")
        String description,

        @Schema(example = "3600", description = "Time-to-live in seconds (default: 3600)")
        @Min(60)
        int ttlSeconds
) {
}
