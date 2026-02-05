package com.juanbenevento.ledger.account.domain.exception;

import com.juanbenevento.ledger.common.domain.exception.DomainException;

import java.util.UUID;

public class AccountNotFoundException extends DomainException {
    public AccountNotFoundException(UUID accountId) {
        super("ACC_003", "Account not found with ID: " + accountId);
    }
}
