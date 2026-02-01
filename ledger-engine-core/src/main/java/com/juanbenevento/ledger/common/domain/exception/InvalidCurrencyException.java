package com.juanbenevento.ledger.common.domain.exception;

public class InvalidCurrencyException extends DomainException {
    public InvalidCurrencyException(String code) {
        super("Invalid ISO-4217 currency code: " + code);
    }
}
