package com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.juanbenevento.ledger.transaction.application.port.in.DepositUseCase;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;

public record WebDepositRequest(
        @Schema(description = "Target Account ID", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
        @NotNull(message = "Account ID is required")
        @JsonProperty("account_id")
        UUID accountId,

        @Schema(description = "Amount to deposit", example = "100.00")
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        BigDecimal amount,

        @Schema(description = "Currency Code", example = "USD")
        @NotBlank(message = "Currency is required")
        @Pattern(regexp = "^[A-Z]{3}$", message = "Invalid currency format")
        String currency,

        @Schema(description = "Idempotency Key", example = "dep-12345")
        @NotBlank(message = "Correlation ID is required")
        @JsonProperty("correlation_id")
        String correlationId,

        @Schema(description = "Origin description", example = "ATM Deposit Branch #4")
        String description
) {
    public DepositUseCase.DepositCommand toCommand() {
        return new DepositUseCase.DepositCommand(
                accountId,
                amount,
                currency,
                description != null ? description : "Cash Deposit",
                correlationId
        );
    }
}
