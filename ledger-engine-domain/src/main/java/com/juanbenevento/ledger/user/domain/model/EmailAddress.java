package com.juanbenevento.ledger.user.domain.model;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Value object representing an encrypted email address.
 * Uses AES-256-GCM for transparent encryption/decryption.
 * Encrypted on construction, decrypted on access.
 */
public class EmailAddress {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final String encryptedValue;
    private final String encryptionKey;

    private EmailAddress(String encryptedValue, String encryptionKey) {
        this.encryptedValue = encryptedValue;
        this.encryptionKey = encryptionKey;
    }

    /**
     * Creates a new EmailAddress, encrypting the plaintext value.
     */
    public static EmailAddress of(String plaintext, String encryptionKey) {
        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException("Email address must not be null or blank");
        }
        String trimmed = plaintext.trim();
        if (!EMAIL_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Invalid email format: " + trimmed);
        }
        String encrypted = encrypt(trimmed, encryptionKey);
        return new EmailAddress(encrypted, encryptionKey);
    }

    /**
     * Reconstitutes an EmailAddress from an already-encrypted value.
     */
    public static EmailAddress reconstitute(String encryptedValue, String encryptionKey) {
        Objects.requireNonNull(encryptedValue, "Encrypted value must not be null");
        Objects.requireNonNull(encryptionKey, "Encryption key must not be null");
        return new EmailAddress(encryptedValue, encryptionKey);
    }

    /**
     * Returns the decrypted plaintext email address.
     */
    public String getPlaintext() {
        return decrypt(encryptedValue, encryptionKey);
    }

    /**
     * Returns the encrypted value (ciphertext with IV prepended).
     */
    public String getEncryptedValue() {
        return encryptedValue;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmailAddress that = (EmailAddress) o;
        return getPlaintext().equals(that.getPlaintext());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getPlaintext());
    }

    @Override
    public String toString() {
        return "EmailAddress{" + getPlaintext() + "}";
    }

    // --- AES-256-GCM encryption/decryption ---

    private static String encrypt(String plaintext, String hexKey) {
        try {
            byte[] keyBytes = hexToBytes(hexKey);
            SecretKey key = new SecretKeySpec(keyBytes, "AES");

            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Prepend IV to ciphertext
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            return bytesToHex(buffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt email address", e);
        }
    }

    private static String decrypt(String encryptedHex, String hexKey) {
        try {
            byte[] combined = hexToBytes(encryptedHex);
            byte[] keyBytes = hexToBytes(hexKey);
            SecretKey key = new SecretKeySpec(keyBytes, "AES");

            ByteBuffer buffer = ByteBuffer.wrap(combined);
            byte[] iv = new byte[GCM_IV_LENGTH];
            buffer.get(iv);

            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt email address", e);
        }
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
