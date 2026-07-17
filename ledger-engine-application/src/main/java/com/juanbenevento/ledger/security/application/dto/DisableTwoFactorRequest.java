package com.juanbenevento.ledger.security.application.dto;

import java.util.UUID;

/**
 * Request to disable 2FA.
 * Requires password verification before disabling.
 */
public record DisableTwoFactorRequest(
        UUID userId,
        String password
) {}