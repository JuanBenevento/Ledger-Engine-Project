package com.juanbenevento.ledger.user.domain.model;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Value object representing an encrypted phone number.
 * Uses AES-256-GCM for transparent encryption/decryption.
 * Phone must start with '+' followed by country code (E.164 format).
 */
public class PhoneNumber {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+[1-9]\\d{6,14}$");

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final String encryptedValue;
    private final String encryptionKey;

    private PhoneNumber(String encryptedValue, String encryptionKey) {
        this.encryptedValue = encryptedValue;
        this.encryptionKey = encryptionKey;
    }

    /**
     * Creates a new PhoneNumber, encrypting the plaintext value.
     */
    public static PhoneNumber of(String plaintext, String encryptionKey) {
        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException("Phone number must not be null or blank");
        }
        String trimmed = plaintext.trim();
        if (!PHONE_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Invalid phone format (expected E.164): " + trimmed);
        }
        String encrypted = encrypt(trimmed, encryptionKey);
        return new PhoneNumber(encrypted, encryptionKey);
    }

    /**
     * Reconstitutes a PhoneNumber from an already-encrypted value.
     */
    public static PhoneNumber reconstitute(String encryptedValue, String encryptionKey) {
        Objects.requireNonNull(encryptedValue, "Encrypted value must not be null");
        Objects.requireNonNull(encryptionKey, "Encryption key must not be null");
        return new PhoneNumber(encryptedValue, encryptionKey);
    }

    /**
     * Returns the decrypted plaintext phone number.
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
        PhoneNumber that = (PhoneNumber) o;
        return getPlaintext().equals(that.getPlaintext());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getPlaintext());
    }

    @Override
    public String toString() {
        return "PhoneNumber{" + getPlaintext() + "}";
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

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            return bytesToHex(buffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt phone number", e);
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
            throw new RuntimeException("Failed to decrypt phone number", e);
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
