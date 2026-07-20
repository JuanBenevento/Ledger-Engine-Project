package com.juanbenevento.ledger.security.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.security.domain.model.TrustedDevice;
import com.juanbenevento.ledger.security.domain.port.TrustedDeviceRepository;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * TODO: Replace with JPA adapter when TrustedDevice persistence is implemented.
 */
@Component
public class TrustedDeviceRepositoryStub implements TrustedDeviceRepository {
    @Override public void save(TrustedDevice device) {}
    @Override public void update(TrustedDevice device) {}
    @Override public Optional<TrustedDevice> findById(UUID id) { return Optional.empty(); }
    @Override public List<TrustedDevice> findByUserId(UUID userId) { return Collections.emptyList(); }
    @Override public Optional<TrustedDevice> findByUserIdAndFingerprint(UUID userId, String fp) { return Optional.empty(); }
    @Override public void deleteById(UUID id) {}
}
