package com.juanbenevento.ledger.domain.exception;

public class AccountAlreadyExistsException extends DomainException {
    public AccountAlreadyExistsException(String accountNumber) {
        super("Account already exists with number: " + accountNumber);
    }
}
