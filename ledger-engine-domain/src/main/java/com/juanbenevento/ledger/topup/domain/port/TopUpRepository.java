package com.juanbenevento.ledger.topup.domain.port;

import com.juanbenevento.ledger.topup.domain.model.TopUp;

import java.util.Optional;
import java.util.UUID;

/**
 * Output port for TopUp persistence.
 * Implemented by the infrastructure adapter.
 */
public interface TopUpRepository {
    void save(TopUp topUp);
    void update(TopUp topUp);
    Optional<TopUp> findById(UUID id);
    Optional<TopUp> findByExternalReference(String externalReference);
    boolean existsByReferenceCode(String referenceCode);
}
