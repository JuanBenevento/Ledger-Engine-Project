package com.juanbenevento.ledger.account.domain.exception;

import com.juanbenevento.ledger.account.domain.model.AccountStatus;
import com.juanbenevento.ledger.common.domain.exception.DomainException;
import lombok.Getter;

import java.util.UUID;

@Getter
public class AccountNotActiveException extends DomainException {
    private final UUID accountId;
    private final AccountStatus status;

    public AccountNotActiveException(UUID accountId, AccountStatus status) {
        super("ACC_002", String.format("Account %s is not active. Current status: %s", accountId, status));
        this.accountId = accountId;
        this.status = status;
    }
}
