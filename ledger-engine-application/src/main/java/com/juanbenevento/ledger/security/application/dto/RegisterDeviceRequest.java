package com.juanbenevento.ledger.security.application.dto;

import java.util.UUID;

/**
 * Request to register a trusted device.
 */
public record RegisterDeviceRequest(
        UUID userId,
        String deviceName,
        String deviceFingerprint
) {}