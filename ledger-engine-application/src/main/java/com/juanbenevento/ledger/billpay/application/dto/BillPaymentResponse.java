package com.juanbenevento.ledger.billpay.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for bill payment operations.
 */
public record BillPaymentResponse(
        @JsonProperty("payment_id")
        UUID paymentId,

        @JsonProperty("wallet_id")
        UUID walletId,

        @JsonProperty("biller_id")
        UUID billerId,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal amount,

        String currency,
        String reference,
        String status,
        String providerResponse,

        @JsonProperty("created_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @JsonProperty("completed_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime completedAt
) {
}
