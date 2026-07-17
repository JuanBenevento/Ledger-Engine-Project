package com.juanbenevento.ledger.security.application.port.input;

import com.juanbenevento.ledger.security.application.dto.DeviceResponse;

import java.util.List;
import java.util.UUID;

/**
 * Use case for listing user devices.
 */
public interface ListDevicesUseCase {
    List<DeviceResponse> execute(UUID userId);
}