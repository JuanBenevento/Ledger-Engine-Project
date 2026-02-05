package com.juanbenevento.ledger.transaction.domain.exception;

import com.juanbenevento.ledger.common.domain.exception.DomainException;
import lombok.Getter;

@Getter
public class TransactionAlreadyProcessedException extends DomainException {
    private final String correlationId;

    public TransactionAlreadyProcessedException(String correlationId) {
        super("LE_TRANSACTION_DUPLICATE", "Transaction with correlationId " + correlationId + " already exists.");
        this.correlationId = correlationId;
    }
}
