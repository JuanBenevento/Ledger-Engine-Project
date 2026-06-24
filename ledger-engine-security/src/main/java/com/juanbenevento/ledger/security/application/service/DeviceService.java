package com.juanbenevento.ledger.security.application.service;

import com.juanbenevento.ledger.security.application.dto.DeviceResponse;
import com.juanbenevento.ledger.security.application.dto.RegisterDeviceRequest;
import com.juanbenevento.ledger.security.application.port.input.ListDevicesUseCase;
import com.juanbenevento.ledger.security.application.port.input.RegisterDeviceUseCase;
import com.juanbenevento.ledger.security.application.port.input.RevokeDeviceUseCase;
import com.juanbenevento.ledger.security.domain.model.TrustedDevice;
import com.juanbenevento.ledger.security.domain.port.TrustedDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService implements RegisterDeviceUseCase, ListDevicesUseCase, RevokeDeviceUseCase {

    private final TrustedDeviceRepository trustedDeviceRepository;

    @Override
    @Transactional
    public DeviceResponse execute(RegisterDeviceRequest request) {
        UUID userId = request.userId();

        // Check if device already exists
        var existingDevice = trustedDeviceRepository.findByUserIdAndFingerprint(
                userId, request.deviceFingerprint());

        if (existingDevice.isPresent()) {
            TrustedDevice device = existingDevice.get();
            device.recordUsage();
            trustedDeviceRepository.update(device);
            return toResponse(device);
        }

        // Create new trusted device
        TrustedDevice device = TrustedDevice.create(
                UUID.randomUUID(),
                userId,
                request.deviceName(),
                request.deviceFingerprint()
        );

        trustedDeviceRepository.save(device);
        return toResponse(device);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> execute(UUID userId) {
        List<TrustedDevice> devices = trustedDeviceRepository.findByUserId(userId);
        return devices.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void execute(UUID userId, UUID deviceId) {
        TrustedDevice device = trustedDeviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));

        if (!device.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Device does not belong to user: " + deviceId);
        }

        device.revoke();
        trustedDeviceRepository.update(device);
    }

    private DeviceResponse toResponse(TrustedDevice device) {
        return new DeviceResponse(
                device.getId(),
                device.getUserId(),
                device.getDeviceName(),
                device.getDeviceFingerprint(),
                device.getLastUsedAt(),
                device.isActive(),
                device.getCreatedAt()
        );
    }
}