package com.juanbenevento.ledger.account.application.dto;

public record CreateAccountRequest(
        String accountNumber,
        String currency,
        String correlationId,
        String requestSource
) {
}
