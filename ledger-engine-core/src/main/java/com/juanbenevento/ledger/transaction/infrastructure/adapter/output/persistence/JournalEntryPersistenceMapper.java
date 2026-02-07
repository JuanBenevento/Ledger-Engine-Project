package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.domain.model.LedgerMovement;
import org.springframework.stereotype.Component;

@Component
public class JournalEntryPersistenceMapper {
    public LedgerMovement toDomainMovement(JournalEntryEntity entryEntity){
        TransactionEntity tx = entryEntity.getTransaction();

        return new LedgerMovement(
                tx.getId(),
                tx.getCorrelationId(),
                tx.getCreatedAt(),
                tx.getCreatedBy(),
                entryEntity.getType(),
                entryEntity.getAmount(),
                Currency.of(entryEntity.getCurrency())
        );
    }
}
