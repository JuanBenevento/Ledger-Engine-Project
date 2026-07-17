package com.juanbenevento.ledger.security.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * TrustedDevice aggregate root.
 * Manages device registration and revocation for a user.
 */
public class TrustedDevice {

    private final UUID id;
    private final UUID userId;
    private final String deviceName;
    private final String deviceFingerprint;
    private Instant lastUsedAt;
    private boolean isActive;
    private final Instant createdAt;
    private Long version;

    private TrustedDevice(UUID id, UUID userId, String deviceName, String deviceFingerprint) {
        this.id = Objects.requireNonNull(id, "TrustedDevice ID must not be null");
        this.userId = Objects.requireNonNull(userId, "User ID must not be null");
        this.deviceName = Objects.requireNonNull(deviceName, "Device name must not be null");
        this.deviceFingerprint = Objects.requireNonNull(deviceFingerprint, "Device fingerprint must not be null");
        this.isActive = true;
        this.createdAt = Instant.now();
        this.version = 0L;
    }

    /**
     * Create a new trusted device.
     */
    public static TrustedDevice create(UUID id, UUID userId, String deviceName, String deviceFingerprint) {
        return new TrustedDevice(id, userId, deviceName, deviceFingerprint);
    }

    /**
     * Reconstitute a trusted device from persistence.
     */
    public static TrustedDevice reconstitute(UUID id, UUID userId, String deviceName,
                                              String deviceFingerprint, Instant lastUsedAt,
                                              boolean isActive, Instant createdAt, Long version) {
        TrustedDevice device = new TrustedDevice(id, userId, deviceName, deviceFingerprint);
        device.lastUsedAt = lastUsedAt;
        device.isActive = isActive;
        device.version = version;
        return device;
    }

    /**
     * Revoke this device.
     */
    public void revoke() {
        if (!this.isActive) {
            throw new IllegalStateException("Device is already revoked: " + this.id);
        }
        this.isActive = false;
    }

    /**
     * Record usage of this device.
     */
    public void recordUsage() {
        this.lastUsedAt = Instant.now();
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getDeviceName() { return deviceName; }
    public String getDeviceFingerprint() { return deviceFingerprint; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public boolean isActive() { return isActive; }
    public Instant getCreatedAt() { return createdAt; }
    public Long getVersion() { return version; }
}