package com.juanbenevento.ledger.billpay.domain.port;

import com.juanbenevento.ledger.billpay.domain.model.Biller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Output port for biller persistence.
 * Implemented by the infrastructure adapter.
 */
public interface BillerRepository {
    Optional<Biller> findById(UUID id);
    List<Biller> findAllActive();
    List<Biller> findByCategory(String category);
}
