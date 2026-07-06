package com.juanbenevento.ledger.account.application.mapper;

import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AccountDtoMapper {
    public Account toDomain(UUID id, CreateAccountRequest request){
        return Account.create(
                id,
                request.accountNumber(),
                Currency.of(request.currency())
        );
    }

    public CreateAccountResponse toResponse(Account account){
        return new CreateAccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getCurrency().toString(),
                account.getAvailableBalanceSnapshot(),
                account.getStatus().name()
        );
    }
}
