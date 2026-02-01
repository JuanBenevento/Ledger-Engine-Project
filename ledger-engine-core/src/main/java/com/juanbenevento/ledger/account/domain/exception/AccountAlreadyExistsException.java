package com.juanbenevento.ledger.account.domain.exception;

import com.juanbenevento.ledger.common.domain.exception.DomainException;

public class AccountAlreadyExistsException extends DomainException {
    public AccountAlreadyExistsException(String accountNumber) {
        super("Account already exists with number: " + accountNumber);
    }
}
