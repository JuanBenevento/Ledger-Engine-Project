package com.juanbenevento.ledger.security.domain.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Two-Factor Authentication aggregate root.
 * Manages TOTP-based 2FA lifecycle including backup codes.
 */
public class TwoFactorAuth {

    private final UUID id;
    private final UUID userId;
    private String secretKey;
    private boolean enabled;
    private List<String> backupCodes;
    private final Instant createdAt;
    private Instant lastUsedAt;
    private Long version;

    private TwoFactorAuth(UUID id, UUID userId, String secretKey) {
        this.id = Objects.requireNonNull(id, "TwoFactorAuth ID must not be null");
        this.userId = Objects.requireNonNull(userId, "User ID must not be null");
        this.secretKey = Objects.requireNonNull(secretKey, "Secret key must not be null");
        this.enabled = false;
        this.backupCodes = new ArrayList<>();
        this.createdAt = Instant.now();
        this.version = 0L;
    }

    /**
     * Create a new 2FA instance for a user with a generated secret key.
     */
    public static TwoFactorAuth create(UUID id, UUID userId, String secretKey) {
        return new TwoFactorAuth(id, userId, secretKey);
    }

    /**
     * Reconstitute a 2FA instance from persistence.
     */
    public static TwoFactorAuth reconstitute(UUID id, UUID userId, String secretKey,
                                              boolean enabled, List<String> backupCodes,
                                              Instant createdAt, Instant lastUsedAt, Long version) {
        TwoFactorAuth tfa = new TwoFactorAuth(id, userId, secretKey);
        tfa.enabled = enabled;
        tfa.backupCodes = new ArrayList<>(backupCodes);
        tfa.lastUsedAt = lastUsedAt;
        tfa.version = version;
        return tfa;
    }

    /**
     * Enable 2FA for the user. Must be called after verifying the first TOTP code.
     * Generates backup codes on enable.
     */
    public void enable() {
        if (this.enabled) {
            throw new IllegalStateException("2FA is already enabled for user: " + this.userId);
        }
        this.enabled = true;
        this.backupCodes = generateBackupCodes();
    }

    /**
     * Disable 2FA for the user.
     */
    public void disable() {
        if (!this.enabled) {
            throw new IllegalStateException("2FA is not enabled for user: " + this.userId);
        }
        this.enabled = false;
        this.backupCodes = Collections.emptyList();
    }

    /**
     * Update the last used timestamp when a code is verified.
     */
    public void recordUsage() {
        this.lastUsedAt = Instant.now();
    }

    /**
     * Consume a backup code (remove it from the list).
     * Returns true if the code was valid and consumed.
     */
    public boolean consumeBackupCode(String code) {
        if (!this.enabled) {
            throw new IllegalStateException("2FA is not enabled for user: " + this.userId);
        }
        return this.backupCodes.remove(code);
    }

    /**
     * Generate a list of random backup codes.
     */
    private List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            codes.add(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return codes;
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getSecretKey() { return secretKey; }
    public boolean isEnabled() { return enabled; }
    public List<String> getBackupCodes() { return new ArrayList<>(backupCodes); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public Long getVersion() { return version; }
}