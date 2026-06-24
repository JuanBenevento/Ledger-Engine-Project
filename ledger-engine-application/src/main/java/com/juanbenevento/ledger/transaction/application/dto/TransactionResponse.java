package com.juanbenevento.ledger.transaction.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TransactionResponse(
        @JsonProperty("transaction_id")
        UUID transactionId,

        @JsonProperty("correlation_id")
        String correlationId,

        TransactionType type,
        String status,

        @JsonProperty("booked_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime bookedAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal amount,

        String currency,
        String description,

        @JsonProperty("source_new_balance")
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal sourceNewBalance,

        @JsonProperty("target_new_balance")
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal targetNewBalance
) {
    public static TransactionResponse from(Transaction tx, Account source, Account target) {
        return new TransactionResponse(
                tx.getId(),
                tx.getCorrelationId(),
                tx.getType(),
                "COMPLETED",
                tx.getCreatedAt(),
                tx.getTotalAmount(),
                source.getCurrency().code().name(),
                tx.getDescription(),
                source.getAvailableBalanceSnapshot(),
                target.getAvailableBalanceSnapshot()
        );
    }
}
