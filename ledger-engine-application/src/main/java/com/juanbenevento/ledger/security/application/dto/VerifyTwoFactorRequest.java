package com.juanbenevento.ledger.security.application.dto;

import java.util.UUID;

/**
 * Request to verify a 2FA code.
 */
public record VerifyTwoFactorRequest(
        UUID userId,
        String code
) {}