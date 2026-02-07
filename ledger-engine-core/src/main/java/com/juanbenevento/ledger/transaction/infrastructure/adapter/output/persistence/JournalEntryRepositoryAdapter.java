package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.transaction.application.port.output.JournalEntryRepository;
import com.juanbenevento.ledger.transaction.domain.model.LedgerMovement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JournalEntryRepositoryAdapter implements JournalEntryRepository {
    private final JournalEntryJpaRepository jpaRepository;
    private final JournalEntryPersistenceMapper mapper;

    @Override
    public List<LedgerMovement> findHistoryByAccountId(UUID accountId) {
        List<JournalEntryEntity> entities = jpaRepository.findHistoryByAccountId(accountId);

        return entities.stream()
                .map(mapper::toDomainMovement)
                .toList();
    }
}
