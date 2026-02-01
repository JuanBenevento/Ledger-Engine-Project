package com.juanbenevento.ledger.account.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.account.domain.model.AccountStatus;
import com.juanbenevento.ledger.common.domain.model.Currency;
import org.springframework.stereotype.Component;

@Component
public class AccountPersistenceMapper {

    public AccountEntity toEntityForCreation(Account account, String correlationId, String createdBySystem){
        return AccountEntity.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .currency(account.getCurrency().toString())
                .accountingBalance(account.getAccountingBalance())
                .availableBalance(account.getAvailableBalance())
                .status(account.getStatus().name())
                .version(0L)
                .correlationId(correlationId)
                .createdBySystem(createdBySystem)
                .isNew(true)
                .build();
    }

    public AccountEntity toEntityForUpdate(Account account, AccountEntity previousEntity) {
        return AccountEntity.builder()
                .id(account.getId())
                .accountingBalance(account.getAccountingBalance())
                .availableBalance(account.getAvailableBalance())
                .status(account.getStatus().name())
                .version(account.getVersion())
                .accountNumber(previousEntity.getAccountNumber())
                .currency(previousEntity.getCurrency())
                .correlationId(previousEntity.getCorrelationId())
                .createdBySystem(previousEntity.getCreatedBySystem())
                .createdAt(previousEntity.getCreatedAt())
                .isNew(false)
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