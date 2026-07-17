package com.juanbenevento.ledger.security.application.port.input;

import java.util.UUID;

/**
 * Use case for revoking a trusted device.
 */
public interface RevokeDeviceUseCase {
    void execute(UUID userId, UUID deviceId);
}