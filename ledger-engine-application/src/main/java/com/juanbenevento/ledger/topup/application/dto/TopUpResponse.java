package com.juanbenevento.ledger.topup.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for top-up operations.
 */
public record TopUpResponse(
        @JsonProperty("top_up_id")
        UUID topUpId,

        @JsonProperty("wallet_id")
        UUID walletId,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal amount,

        String currency,
        String method,
        String status,

        @JsonProperty("reference_code")
        String referenceCode,

        @JsonProperty("created_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @JsonProperty("completed_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime completedAt
) {
}
