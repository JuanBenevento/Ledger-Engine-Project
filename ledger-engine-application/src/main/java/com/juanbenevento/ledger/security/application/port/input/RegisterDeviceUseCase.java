package com.juanbenevento.ledger.security.application.port.input;

import com.juanbenevento.ledger.security.application.dto.DeviceResponse;
import com.juanbenevento.ledger.security.application.dto.RegisterDeviceRequest;

/**
 * Use case for registering a trusted device.
 */
public interface RegisterDeviceUseCase {
    DeviceResponse execute(RegisterDeviceRequest request);
}