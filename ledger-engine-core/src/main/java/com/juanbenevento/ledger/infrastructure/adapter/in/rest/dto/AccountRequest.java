package com.juanbenevento.ledger.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AccountRequest(
        @Schema(example = "ACC-2026-001", description = "Unique account identifier")
        @NotBlank
        String accountNumber,

        @Schema(example = "USD", description = "ISO-4217 3-letter currency code")
        @NotBlank @Size(min = 3, max = 3) @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @Schema(example = "uuid-correlation-123", description = "Mandatory ID for idempotency control")
        @NotBlank
        String correlationId,

        @Schema(example = "MOBILE_APP", description = "System identifier for auditing purposes")
        @NotBlank
        String requestSource
) {
}
