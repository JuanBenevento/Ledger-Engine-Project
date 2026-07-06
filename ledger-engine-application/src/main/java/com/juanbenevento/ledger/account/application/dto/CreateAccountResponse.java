package com.juanbenevento.ledger.account.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateAccountResponse(
        UUID id,
        String accountNumber,
        String currency,
        BigDecimal availableBalance,
        String status
) {
}
