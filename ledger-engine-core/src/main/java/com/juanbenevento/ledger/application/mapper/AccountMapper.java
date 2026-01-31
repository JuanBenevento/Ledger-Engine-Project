package com.juanbenevento.ledger.application.mapper;

import com.juanbenevento.ledger.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.domain.model.Account;
import com.juanbenevento.ledger.domain.model.Currency;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AccountMapper {
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
                account.getAvailableBalance(),
                account.getStatus().name()
        );
    }
}
