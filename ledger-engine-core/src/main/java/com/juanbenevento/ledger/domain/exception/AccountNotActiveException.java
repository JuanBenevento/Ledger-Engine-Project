package com.juanbenevento.ledger.domain.exception;

import com.juanbenevento.ledger.domain.model.AccountStatus;

public class AccountNotActiveException extends DomainException {
    public AccountNotActiveException(AccountStatus status) {
        super("Account is not active. Current status: " + status);
    }
}
