package com.juanbenevento.ledger.topup.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for PSE top-up initiation.
 */
public record PseTopUpResponse(
        @JsonProperty("top_up_id")
        UUID topUpId,

        @JsonProperty("wallet_id")
        UUID walletId,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal amount,

        String currency,
        String method,
        String status,

        @JsonProperty("redirect_url")
        String redirectUrl,

        @JsonProperty("expires_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime expiresAt,

        @JsonProperty("created_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {
}
