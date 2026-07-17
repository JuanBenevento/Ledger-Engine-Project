package com.juanbenevento.ledger.qr.infrastructure.adapter.output.crypto;

import com.juanbenevento.ledger.qr.domain.port.QrPayloadSigner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * HMAC-SHA256 implementation of QrPayloadSigner port.
 * Signs QR payloads for integrity verification.
 */
@Component
public class HmacSha256QrPayloadSigner implements QrPayloadSigner {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final SecretKeySpec secretKey;

    public HmacSha256QrPayloadSigner(@Value("${qr.hmac-secret:default-secret-key-change-in-production}") String secret) {
        this.secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
    }

    @Override
    public String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to sign QR payload", e);
        }
    }

    @Override
    public boolean verify(String payload, String signature) {
        String expectedSignature = sign(payload);
        return expectedSignature.equals(signature);
    }
}
