package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record WebCashTopUpRequest(
        @Schema(description = "Amount to top up", example = "50000.00")
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        BigDecimal amount,

        @Schema(example = "COP", description = "ISO-4217 currency code")
        @NotBlank @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @Schema(description = "Idempotency key")
        String correlationId
) {
}
