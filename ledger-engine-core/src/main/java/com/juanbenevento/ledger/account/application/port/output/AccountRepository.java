package com.juanbenevento.ledger.account.application.port.output;

import com.juanbenevento.ledger.account.domain.model.Account;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository {
    void save(Account account, String correlationId, String createdBySystem);
    void update(Account account);
    boolean existsByAccountNumber(String accountNumber);
    Optional<Account> findById(UUID id);
    Optional<Account> findByCorrelationId(String correlationId);
}
