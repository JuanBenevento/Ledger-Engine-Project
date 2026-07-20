package com.juanbenevento.ledger.billpay.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.billpay.domain.model.BillPayment;
import com.juanbenevento.ledger.billpay.domain.port.BillPaymentRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * TODO: Replace with JPA adapter when bill payment persistence is implemented.
 */
@Component
public class BillPaymentRepositoryStub implements BillPaymentRepository {
    @Override public void save(BillPayment payment) {}
    @Override public void update(BillPayment payment) {}
    @Override public Optional<BillPayment> findById(UUID id) { return Optional.empty(); }
}
