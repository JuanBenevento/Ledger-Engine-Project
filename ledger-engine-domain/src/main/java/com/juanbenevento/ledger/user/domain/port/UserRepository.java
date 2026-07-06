package com.juanbenevento.ledger.user.domain.port;

import com.juanbenevento.ledger.user.domain.model.User;

import java.util.Optional;
import java.util.UUID;

/**
 * Output port for User persistence.
 * Implemented by the infrastructure adapter.
 */
public interface UserRepository {
    void save(User user);
    void update(User user);
    Optional<User> findById(UUID id);
    boolean existsByEmail(String encryptedEmail);
    boolean existsByPhone(String encryptedPhone);
}
