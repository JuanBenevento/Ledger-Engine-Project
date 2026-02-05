package com.juanbenevento.ledger.common.domain.exception;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class InsufficientFundsException extends DomainException {
    private final UUID accountId;
    private final BigDecimal currentBalance;
    private final BigDecimal attemptedAmount;

    public InsufficientFundsException(UUID accountId, BigDecimal currentBalance, BigDecimal attemptedAmount) {
        super("LE_INSUFFICIENT_FUNDS", String.format(
                "Account %s has insufficient funds. Balance: %s, Attempted: %s",
                accountId, currentBalance, attemptedAmount));

        this.accountId = accountId;
        this.currentBalance = currentBalance;
        this.attemptedAmount = attemptedAmount;
    }
}
