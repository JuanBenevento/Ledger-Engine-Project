package com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record WebCreateTransferRequest(

        @Schema(description = "UUID of the source account", example = "123e4567-e89b-12d3-a456-426614174000")
        @NotNull(message = "Source account ID is mandatory")
        @JsonProperty("source_account_id")
        UUID sourceAccountId,

        @Schema(description = "UUID of the target account", example = "123e4567-e89b-12d3-a456-426614174001")
        @NotNull(message = "Target account ID is mandatory")
        @JsonProperty("target_account_id")
        UUID targetAccountId,

        @Schema(description = "Amount to transfer. Must be positive.", example = "100.50")
        @NotNull(message = "Amount is mandatory")
        @DecimalMin(value = "0.01", message = "Transfer amount must be greater than zero")
        @Digits(integer = 15, fraction = 4, message = "Amount format is invalid (max 4 decimal places)")
        BigDecimal amount,

        @Schema(description = "ISO-4217 Currency Code", example = "USD")
        @NotBlank(message = "Currency is mandatory")
        @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
        @Pattern(regexp = "[A-Z]{3}", message = "Currency must be uppercase ISO code")
        String currency,

        @Schema(description = "Reason for the transfer", example = "Invoice payment #99")
        @Size(max = 255, message = "Description too long")
        String description,

        @Schema(description = "Unique key for idempotency", example = "c4d5-99a1")
        @NotBlank(message = "Correlation ID is mandatory for safe retries")
        @JsonProperty("correlation_id")
        String correlationId
) {
    public CreateTransferRequest toCommand(String auditUser) {
        return new CreateTransferRequest(
                this.sourceAccountId,
                this.targetAccountId,
                this.amount,
                this.currency,
                this.description,
                this.correlationId,
                auditUser
        );
    }
}
