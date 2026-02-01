package com.juanbenevento.ledger.account.domain.exception;

import com.juanbenevento.ledger.account.domain.model.AccountStatus;
import com.juanbenevento.ledger.common.domain.exception.DomainException;

public class AccountNotActiveException extends DomainException {
    public AccountNotActiveException(AccountStatus status) {
        super("Account is not active. Current status: " + status);
    }
}
