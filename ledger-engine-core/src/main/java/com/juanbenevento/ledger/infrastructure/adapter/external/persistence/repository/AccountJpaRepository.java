package com.juanbenevento.ledger.infrastructure.adapter.external.persistence.repository;

import com.juanbenevento.ledger.infrastructure.adapter.external.persistence.entity.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountJpaRepository extends JpaRepository<AccountEntity, UUID> {
    boolean existsByAccountNumber(String accountNumber);
    Optional<AccountEntity> findByCorrelationId(String correlationId);
}
