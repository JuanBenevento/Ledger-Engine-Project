package com.juanbenevento.ledger.transaction.application.port.output;

import com.juanbenevento.ledger.transaction.domain.model.Transaction;

public interface TransactionRepository {
    void save(Transaction transaction, String createdBy);
    boolean existsByCorrelationId(String correlationId);
}
