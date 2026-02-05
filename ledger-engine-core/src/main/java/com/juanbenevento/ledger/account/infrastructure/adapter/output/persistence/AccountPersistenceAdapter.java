package com.juanbenevento.ledger.account.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
class AccountPersistenceAdapter implements AccountRepository {

    private final AccountJpaRepository jpaRepository;
    private final AccountPersistenceMapper mapper;

    @Override
    public void save(Account account, String correlationId, String createdBySystem) {
        AccountEntity entity = mapper.toEntityForCreation(account, correlationId, createdBySystem);
        jpaRepository.save(entity);
    }

    @Override
    public void update(Account account, String modifiedBy) {
        AccountEntity existing = jpaRepository.findById(account.getId())
                .orElseThrow(() -> new AccountNotFoundException(account.getId()));

        // Pasamos el modifiedBy al mapper
        AccountEntity entity = mapper.toEntityForUpdate(account, existing, modifiedBy);

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
