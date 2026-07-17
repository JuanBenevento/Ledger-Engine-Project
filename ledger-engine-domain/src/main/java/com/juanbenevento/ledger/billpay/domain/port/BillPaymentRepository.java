package com.juanbenevento.ledger.billpay.domain.port;

import com.juanbenevento.ledger.billpay.domain.model.BillPayment;

import java.util.Optional;
import java.util.UUID;

/**
 * Output port for bill payment persistence.
 * Implemented by the infrastructure adapter.
 */
public interface BillPaymentRepository {
    void save(BillPayment payment);
    void update(BillPayment payment);
    Optional<BillPayment> findById(UUID id);
}
