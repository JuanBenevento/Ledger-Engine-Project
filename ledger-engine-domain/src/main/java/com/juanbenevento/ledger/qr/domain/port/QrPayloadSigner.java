package com.juanbenevento.ledger.qr.domain.port;

/**
 * Port for HMAC payload signing.
 * Used to sign QR code data for integrity verification.
 * Implemented by the infrastructure adapter.
 */
public interface QrPayloadSigner {
    /**
     * Signs the given payload using HMAC-SHA256.
     */
    String sign(String payload);

    /**
     * Verifies the HMAC signature of the given payload.
     */
    boolean verify(String payload, String signature);
}
