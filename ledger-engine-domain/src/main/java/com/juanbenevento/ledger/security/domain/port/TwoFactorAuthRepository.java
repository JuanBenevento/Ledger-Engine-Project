package com.juanbenevento.ledger.security.domain.port;

import com.juanbenevento.ledger.security.domain.model.TwoFactorAuth;

import java.util.Optional;
import java.util.UUID;

/**
 * Output port for TwoFactorAuth persistence.
 * Implemented by the infrastructure adapter.
 */
public interface TwoFactorAuthRepository {
    void save(TwoFactorAuth twoFactorAuth);
    void update(TwoFactorAuth twoFactorAuth);
    Optional<TwoFactorAuth> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}