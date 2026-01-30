package com.juanbenevento.ledger.domain.exception;

public class InsufficientFundsException extends DomainException {
    public InsufficientFundsException() {
        super("Insufficient available balance to perform the operation.");
    }
}
