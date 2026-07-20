package com.juanbenevento.ledger.billpay.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.billpay.domain.model.Biller;
import com.juanbenevento.ledger.billpay.domain.port.BillerRepository;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * In-memory stub implementation of BillerRepository.
 * TODO: Replace with JPA adapter when biller persistence is implemented.
 */
@Component
public class BillerRepositoryStub implements BillerRepository {

    @Override
    public Optional<Biller> findById(UUID id) {
        return Optional.empty();
    }

    @Override
    public List<Biller> findAllActive() {
        return Collections.emptyList();
    }

    @Override
    public List<Biller> findByCategory(String category) {
        return Collections.emptyList();
    }
}
