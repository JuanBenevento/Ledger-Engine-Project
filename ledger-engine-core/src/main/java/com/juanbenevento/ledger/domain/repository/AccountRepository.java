package com.juanbenevento.ledger.domain.repository;

import com.juanbenevento.ledger.domain.model.Account;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository {
    void save(Account account);
    boolean existsByAccountNumber(String accountNumber);
    Optional<Account> findById(UUID id);
}
