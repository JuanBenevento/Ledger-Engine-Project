package com.juanbenevento.ledger.p2p.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record WebSendMoneyRequest(
        @Schema(description = "Recipient identifier (email, phone, or QR code)")
        @NotBlank
        String recipientIdentifier,

        @Schema(description = "Lookup type: EMAIL, PHONE, or QR")
        @NotBlank @Pattern(regexp = "^(EMAIL|PHONE|QR)$")
        String lookupType,

        @Schema(description = "Amount to transfer", example = "50000.00")
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        BigDecimal amount,

        @Schema(example = "COP", description = "ISO-4217 currency code")
        @NotBlank @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @Schema(description = "Transfer note (optional)")
        String note,

        @Schema(description = "Idempotency key")
        String correlationId
) {
}
