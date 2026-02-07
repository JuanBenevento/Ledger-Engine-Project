package com.juanbenevento.ledger.transaction.domain.exception;

import com.juanbenevento.ledger.common.domain.exception.DomainException;

public class InvalidTransactionException extends DomainException {
    public InvalidTransactionException(String message) {
        super("LE_TRANSACTION_INVALID", message);
    }
}
