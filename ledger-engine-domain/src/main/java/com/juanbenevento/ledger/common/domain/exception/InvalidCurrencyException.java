package com.juanbenevento.ledger.common.domain.exception;

public class InvalidCurrencyException extends DomainException {
    public InvalidCurrencyException(String code) {
        super("COM_001", "Invalid ISO-4217 currency code: " + code);
    }
}
