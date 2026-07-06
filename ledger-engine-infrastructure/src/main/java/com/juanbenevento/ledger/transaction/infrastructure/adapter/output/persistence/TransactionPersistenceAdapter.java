package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.transaction.application.port.output.TransactionRepository;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionPersistenceAdapter implements TransactionRepository {

    private final TransactionJpaRepository jpaRepository;
    private final TransactionPersistenceMapper mapper;

    @Override
    public void save(Transaction transaction, String createdBy) {
        TransactionEntity entity = mapper.toEntity(transaction, createdBy);
        jpaRepository.save(entity);
    }

    @Override
    public boolean existsByCorrelationId(String correlationId) {
        return jpaRepository.existsByCorrelationId(correlationId);
    }
}
