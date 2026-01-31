package com.juanbenevento.ledger.infrastructure.adapter.external.persistence.mapper;

import com.juanbenevento.ledger.domain.model.Account;
import com.juanbenevento.ledger.domain.model.AccountStatus;
import com.juanbenevento.ledger.domain.model.Currency;
import com.juanbenevento.ledger.infrastructure.adapter.external.persistence.entity.AccountEntity;
import org.springframework.stereotype.Component;

@Component
public class AccountPersistenceMapper {

    public AccountEntity toEntity(Account account, String correlationId, String createdBySystem){
        return AccountEntity.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .currency(account.getCurrency().toString())
                .accountingBalance(account.getAccountingBalance())
                .availableBalance(account.getAvailableBalance())
                .status(account.getStatus().name())
                .version(null)
                .correlationId(correlationId)
                .createdBySystem(createdBySystem)
                .isNew(true)
                .build();
    }

    public Account toDomain(AccountEntity entity){
        return Account.reconstitute(
                entity.getId(),
                entity.getAccountNumber(),
                Currency.of(entity.getCurrency()),
                entity.getAccountingBalance(),
                entity.getAvailableBalance(),
                AccountStatus.valueOf(entity.getStatus()),
                entity.getVersion()
        );
    }
}