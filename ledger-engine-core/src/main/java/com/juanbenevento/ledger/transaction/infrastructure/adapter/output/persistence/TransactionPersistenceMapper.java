package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntry;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
class TransactionPersistenceMapper {

    public TransactionEntity toEntity(Transaction domain, String createdBy) {
        TransactionEntity transactionEntity = TransactionEntity.builder()
                .id(domain.getId())
                .correlationId(domain.getCorrelationId())
                .description(domain.getDescription())
                .transactionType(domain.getType().name())
                .createdAt(domain.getCreatedAt())
                .createdBy(createdBy)
                .isNew(true)
                .build();

        if (domain.getEntries() != null) {
            domain.getEntries().forEach(domainEntry -> {
                JournalEntryEntity entryEntity = toEntryEntity(domainEntry);

                transactionEntity.addEntry(entryEntity);
            });
        }

        return transactionEntity;
    }

    private JournalEntryEntity toEntryEntity(JournalEntry domainEntry){
        return JournalEntryEntity.builder()
                .id(domainEntry.getId())
                .accountId(domainEntry.getAccountId())
                .amount(domainEntry.getAmount())
                .currency(domainEntry.getCurrency().code().name())
                .type(domainEntry.getType())
                .build();
    }

    public Transaction toDomain(TransactionEntity entity){
        List<JournalEntry> domainEntries = entity.getEntries().stream()
                .map(this::toEntryDomain)
                .collect(Collectors.toList());

        return Transaction.reconstitute(
                entity.getId(),
                entity.getCorrelationId(),
                entity.getDescription(),
                TransactionType.valueOf(entity.getTransactionType()),
                entity.getCreatedAt(),
                domainEntries
        );
    }

    private JournalEntry toEntryDomain(JournalEntryEntity entity) {
        return JournalEntry.reconstitute(
                entity.getId(),
                entity.getAccountId(),
                entity.getAmount(),
                Currency.of(entity.getCurrency()),
                entity.getType()
        );
    }
}
