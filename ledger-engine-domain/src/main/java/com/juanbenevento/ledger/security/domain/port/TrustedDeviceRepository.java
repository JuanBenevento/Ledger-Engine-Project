package com.juanbenevento.ledger.security.domain.port;

import com.juanbenevento.ledger.security.domain.model.TrustedDevice;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Output port for TrustedDevice persistence.
 * Implemented by the infrastructure adapter.
 */
public interface TrustedDeviceRepository {
    void save(TrustedDevice device);
    void update(TrustedDevice device);
    Optional<TrustedDevice> findById(UUID id);
    List<TrustedDevice> findByUserId(UUID userId);
    Optional<TrustedDevice> findByUserIdAndFingerprint(UUID userId, String fingerprint);
    void deleteById(UUID id);
}