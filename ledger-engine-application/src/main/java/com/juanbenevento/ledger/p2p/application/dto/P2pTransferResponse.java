package com.juanbenevento.ledger.p2p.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for P2P transfer operations.
 */
public record P2pTransferResponse(
        @JsonProperty("transfer_id")
        UUID transferId,

        @JsonProperty("sender_wallet_id")
        UUID senderWalletId,

        @JsonProperty("recipient_wallet_id")
        UUID recipientWalletId,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal amount,

        String currency,
        String status,
        String note,

        @JsonProperty("created_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @JsonProperty("completed_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime completedAt
) {
}
