package com.juanbenevento.ledger.application.dto;

public record CreateAccountRequest(
        String accountNumber,
        String currency
) {
}
