package com.juanbenevento.ledger.security.application.service;

import com.juanbenevento.ledger.security.application.dto.DeviceResponse;
import com.juanbenevento.ledger.security.application.dto.RegisterDeviceRequest;
import com.juanbenevento.ledger.security.domain.model.TrustedDevice;
import com.juanbenevento.ledger.security.domain.port.TrustedDeviceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceServiceTest {

    @Mock
    private TrustedDeviceRepository trustedDeviceRepository;

    @InjectMocks
    private DeviceService deviceService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void shouldRegisterNewDevice() {
        // Given
        RegisterDeviceRequest request = new RegisterDeviceRequest(
                userId, "iPhone 15", "abc123def456");
        when(trustedDeviceRepository.findByUserIdAndFingerprint(userId, "abc123def456"))
                .thenReturn(Optional.empty());

        // When
        DeviceResponse response = deviceService.execute(request);

        // Then
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.deviceName()).isEqualTo("iPhone 15");
        assertThat(response.deviceFingerprint()).isEqualTo("abc123def456");
        assertThat(response.isActive()).isTrue();
        verify(trustedDeviceRepository).save(any(TrustedDevice.class));
    }

    @Test
    void shouldUpdateExistingDevice() {
        // Given
        RegisterDeviceRequest request = new RegisterDeviceRequest(
                userId, "iPhone 15", "abc123def456");
        TrustedDevice existingDevice = TrustedDevice.create(
                UUID.randomUUID(), userId, "iPhone 15", "abc123def456");
        when(trustedDeviceRepository.findByUserIdAndFingerprint(userId, "abc123def456"))
                .thenReturn(Optional.of(existingDevice));

        // When
        DeviceResponse response = deviceService.execute(request);

        // Then
        assertThat(response.id()).isEqualTo(existingDevice.getId());
        verify(trustedDeviceRepository).update(existingDevice);
        verify(trustedDeviceRepository, never()).save(any());
    }

    @Test
    void shouldListUserDevices() {
        // Given
        TrustedDevice device1 = TrustedDevice.create(
                UUID.randomUUID(), userId, "iPhone 15", "abc123");
        TrustedDevice device2 = TrustedDevice.create(
                UUID.randomUUID(), userId, "Samsung Galaxy", "xyz789");
        when(trustedDeviceRepository.findByUserId(userId)).thenReturn(List.of(device1, device2));

        // When
        List<DeviceResponse> devices = deviceService.execute(userId);

        // Then
        assertThat(devices).hasSize(2);
    }

    @Test
    void shouldRevokeDevice() {
        // Given
        UUID deviceId = UUID.randomUUID();
        TrustedDevice device = TrustedDevice.create(deviceId, userId, "iPhone 15", "abc123");
        when(trustedDeviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        // When
        deviceService.execute(userId, deviceId);

        // Then
        assertThat(device.isActive()).isFalse();
        verify(trustedDeviceRepository).update(device);
    }

    @Test
    void shouldThrowWhenRevokingNonexistentDevice() {
        // Given
        UUID deviceId = UUID.randomUUID();
        when(trustedDeviceRepository.findById(deviceId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> deviceService.execute(userId, deviceId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Device not found");
    }

    @Test
    void shouldThrowWhenRevokingDeviceOwnedByDifferentUser() {
        // Given
        UUID deviceId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        TrustedDevice device = TrustedDevice.create(deviceId, otherUserId, "iPhone 15", "abc123");
        when(trustedDeviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        // When & Then
        assertThatThrownBy(() -> deviceService.execute(userId, deviceId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to user");
    }
}