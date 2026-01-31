package com.juanbenevento.ledger.infrastructure.adapter.external.persistence.adapter;

import com.juanbenevento.ledger.domain.model.Account;
import com.juanbenevento.ledger.domain.repository.AccountRepository;
import com.juanbenevento.ledger.infrastructure.adapter.external.persistence.entity.AccountEntity;
import com.juanbenevento.ledger.infrastructure.adapter.external.persistence.mapper.AccountPersistenceMapper;
import com.juanbenevento.ledger.infrastructure.adapter.external.persistence.repository.AccountJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AccountPersistenceAdapter implements AccountRepository {

    private final AccountJpaRepository jpaRepository;
    private final AccountPersistenceMapper mapper;

    @Override
    public void save(Account account, String correlationId, String createdBySystem) {
        AccountEntity entity = mapper.toEntity(account, correlationId, createdBySystem);
        jpaRepository.save(entity);
    }

    @Override
    public boolean existsByAccountNumber(String accountNumber) {
        return jpaRepository.existsByAccountNumber(accountNumber);
    }

    @Override
    public Optional<Account> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Account> findByCorrelationId(String correlationId) {
        return jpaRepository.findByCorrelationId(correlationId).map(mapper::toDomain);
    }
}
