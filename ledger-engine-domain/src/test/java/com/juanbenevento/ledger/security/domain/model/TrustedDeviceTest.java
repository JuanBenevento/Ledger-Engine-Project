package com.juanbenevento.ledger.security.domain.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TrustedDeviceTest {

    @Test
    void shouldCreateTrustedDevice() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String deviceName = "iPhone 15";
        String fingerprint = "abc123def456";

        // When
        TrustedDevice device = TrustedDevice.create(id, userId, deviceName, fingerprint);

        // Then
        assertThat(device.getId()).isEqualTo(id);
        assertThat(device.getUserId()).isEqualTo(userId);
        assertThat(device.getDeviceName()).isEqualTo(deviceName);
        assertThat(device.getDeviceFingerprint()).isEqualTo(fingerprint);
        assertThat(device.isActive()).isTrue();
        assertThat(device.getLastUsedAt()).isNull();
        assertThat(device.getVersion()).isEqualTo(0L);
    }

    @Test
    void shouldRevokeDevice() {
        // Given
        TrustedDevice device = TrustedDevice.create(
                UUID.randomUUID(), UUID.randomUUID(), "iPhone 15", "abc123");

        // When
        device.revoke();

        // Then
        assertThat(device.isActive()).isFalse();
    }

    @Test
    void shouldThrowWhenRevokingAlreadyRevokedDevice() {
        // Given
        TrustedDevice device = TrustedDevice.create(
                UUID.randomUUID(), UUID.randomUUID(), "iPhone 15", "abc123");
        device.revoke();

        // When & Then
        assertThatThrownBy(device::revoke)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already revoked");
    }

    @Test
    void shouldRecordUsage() {
        // Given
        TrustedDevice device = TrustedDevice.create(
                UUID.randomUUID(), UUID.randomUUID(), "iPhone 15", "abc123");
        assertThat(device.getLastUsedAt()).isNull();

        // When
        device.recordUsage();

        // Then
        assertThat(device.getLastUsedAt()).isNotNull();
    }

    @Test
    void shouldReconstituteFromPersistence() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String deviceName = "Samsung Galaxy";
        String fingerprint = "xyz789";
        Instant lastUsedAt = Instant.now();
        Instant createdAt = Instant.now();

        // When
        TrustedDevice device = TrustedDevice.reconstitute(
                id, userId, deviceName, fingerprint, lastUsedAt, true, createdAt, 1L);

        // Then
        assertThat(device.getId()).isEqualTo(id);
        assertThat(device.getUserId()).isEqualTo(userId);
        assertThat(device.getDeviceName()).isEqualTo(deviceName);
        assertThat(device.getDeviceFingerprint()).isEqualTo(fingerprint);
        assertThat(device.getLastUsedAt()).isEqualTo(lastUsedAt);
        assertThat(device.isActive()).isTrue();
        assertThat(device.getVersion()).isEqualTo(1L);
    }
}