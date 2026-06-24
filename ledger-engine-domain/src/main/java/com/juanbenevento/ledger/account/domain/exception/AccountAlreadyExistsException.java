package com.juanbenevento.ledger.account.domain.exception;

import com.juanbenevento.ledger.common.domain.exception.DomainException;
import lombok.Getter;

@Getter
public class AccountAlreadyExistsException extends DomainException {
    private final String accountNumber;

    public AccountAlreadyExistsException(String accountNumber) {
        super("ACC_004", "Account already exists with number: " + accountNumber);
        this.accountNumber = accountNumber;
    }
}
