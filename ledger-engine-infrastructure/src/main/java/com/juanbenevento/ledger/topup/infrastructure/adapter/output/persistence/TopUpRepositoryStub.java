package com.juanbenevento.ledger.topup.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.topup.domain.model.TopUp;
import com.juanbenevento.ledger.topup.domain.port.TopUpRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * TODO: Replace with JPA adapter when TopUp persistence is implemented.
 */
@Component
public class TopUpRepositoryStub implements TopUpRepository {
    @Override public void save(TopUp topUp) {}
    @Override public void update(TopUp topUp) {}
    @Override public Optional<TopUp> findById(UUID id) { return Optional.empty(); }
    @Override public Optional<TopUp> findByExternalReference(String ref) { return Optional.empty(); }
    @Override public boolean existsByReferenceCode(String code) { return false; }
}
