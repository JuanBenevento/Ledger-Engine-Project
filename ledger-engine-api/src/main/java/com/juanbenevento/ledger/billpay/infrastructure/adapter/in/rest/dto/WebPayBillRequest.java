package com.juanbenevento.ledger.billpay.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;

public record WebPayBillRequest(
        @Schema(description = "Wallet ID to pay from")
        @NotNull UUID walletId,

        @Schema(description = "User ID who owns the wallet")
        @NotNull UUID userId,

        @Schema(description = "Biller ID to pay")
        @NotNull UUID billerId,

        @Schema(example = "150000.00", description = "Amount to pay")
        @NotNull @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        BigDecimal amount,

        @Schema(example = "COP", description = "ISO-4217 currency code")
        @NotBlank @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @Schema(description = "Bill reference number")
        @NotBlank String reference,

        @Schema(description = "Idempotency key")
        String correlationId
) {
}
