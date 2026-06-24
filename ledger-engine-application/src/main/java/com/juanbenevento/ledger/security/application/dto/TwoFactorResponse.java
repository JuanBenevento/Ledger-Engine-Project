package com.juanbenevento.ledger.security.application.dto;

import java.util.UUID;

/**
 * Generic response for 2FA operations.
 */
public record TwoFactorResponse(
        UUID userId,
        boolean enabled,
        String message
) {}