package com.juanbenevento.ledger.security.application.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for device operations.
 */
public record DeviceResponse(
        UUID id,
        UUID userId,
        String deviceName,
        String deviceFingerprint,
        Instant lastUsedAt,
        boolean isActive,
        Instant createdAt
) {}