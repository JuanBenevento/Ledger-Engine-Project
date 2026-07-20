package com.juanbenevento.ledger.security.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.security.domain.model.TwoFactorAuth;
import com.juanbenevento.ledger.security.domain.port.TwoFactorAuthRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * TODO: Replace with JPA adapter when 2FA persistence is implemented.
 */
@Component
public class TwoFactorAuthRepositoryStub implements TwoFactorAuthRepository {
    @Override public void save(TwoFactorAuth tfa) {}
    @Override public void update(TwoFactorAuth tfa) {}
    @Override public Optional<TwoFactorAuth> findByUserId(UUID userId) { return Optional.empty(); }
    @Override public boolean existsByUserId(UUID userId) { return false; }
}
