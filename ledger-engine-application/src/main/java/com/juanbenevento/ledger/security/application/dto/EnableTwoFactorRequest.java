package com.juanbenevento.ledger.security.application.dto;

import java.util.UUID;

/**
 * Request to enable 2FA for a user.
 */
public record EnableTwoFactorRequest(
        UUID userId,
        String password
) {}