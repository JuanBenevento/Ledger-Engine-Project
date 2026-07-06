package com.juanbenevento.ledger.common.domain.exception;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class LedgerIntegrityException extends DomainException {
    private final UUID accountId;
    private final BigDecimal calculateBalance;
    private final BigDecimal snapshotBalance;
    private final BigDecimal difference;

    public LedgerIntegrityException(UUID accountId, BigDecimal calculateBalance, BigDecimal snapshotBalance) {
        super(
                "LE_CRITICAL_INTEGRITY_FAILURE",
                String.format("Critical: Ledger mismatch for Account %s. History sum: %s snapshot: %s",
                        accountId, calculateBalance, snapshotBalance)
        );
        this.accountId = accountId;
        this.calculateBalance = calculateBalance;
        this.snapshotBalance = snapshotBalance;
        this.difference = calculateBalance.subtract(snapshotBalance);
    }
}
