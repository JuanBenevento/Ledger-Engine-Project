package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Webhook callback payload from PSE payment gateway.
 */
public record PseWebhookCallback(
        @Schema(description = "External reference from the PSE gateway")
        @NotBlank
        String externalReference,

        @Schema(description = "Payment success status")
        boolean success,

        @Schema(description = "Failure reason if payment failed")
        String failureReason,

        @Schema(description = "HMAC-SHA256 signature for request validation")
        @NotBlank
        String signature
) {
}
