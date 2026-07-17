package com.juanbenevento.ledger.security.application.dto;

import java.util.List;
import java.util.UUID;

/**
 * Response when enabling 2FA.
 * Contains the secret key and QR code URI for the authenticator app.
 */
public record EnableTwoFactorResponse(
        UUID userId,
        String secretKey,
        String qrCodeUri,
        List<String> backupCodes
) {}