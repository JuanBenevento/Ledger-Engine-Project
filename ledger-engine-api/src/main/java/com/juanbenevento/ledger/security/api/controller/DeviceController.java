package com.juanbenevento.ledger.security.api.controller;

import com.juanbenevento.ledger.security.application.dto.DeviceResponse;
import com.juanbenevento.ledger.security.application.dto.RegisterDeviceRequest;
import com.juanbenevento.ledger.security.application.port.input.ListDevicesUseCase;
import com.juanbenevento.ledger.security.application.port.input.RegisterDeviceUseCase;
import com.juanbenevento.ledger.security.application.port.input.RevokeDeviceUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/security/devices")
@RequiredArgsConstructor
@Tag(name = "Device Management", description = "Trusted device management endpoints")
public class DeviceController {

    private final RegisterDeviceUseCase registerDeviceUseCase;
    private final ListDevicesUseCase listDevicesUseCase;
    private final RevokeDeviceUseCase revokeDeviceUseCase;

    @Operation(
            summary = "Register a trusted device",
            description = "Registers a new trusted device or updates the last used timestamp if already registered.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Device registered successfully",
                            content = @Content(schema = @Schema(implementation = DeviceResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data")
            }
    )
    @PostMapping
    public ResponseEntity<DeviceResponse> registerDevice(
            @Valid @RequestBody RegisterDeviceRequest request) {
        DeviceResponse response = registerDeviceUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "List user devices",
            description = "Returns all trusted devices for a user.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of devices",
                            content = @Content(schema = @Schema(implementation = DeviceResponse.class))
                    )
            }
    )
    @GetMapping
    public ResponseEntity<List<DeviceResponse>> listDevices(
            @RequestParam UUID userId) {
        List<DeviceResponse> devices = listDevicesUseCase.execute(userId);
        return ResponseEntity.ok(devices);
    }

    @Operation(
            summary = "Revoke a trusted device",
            description = "Revokes a trusted device, preventing future authentication from this device.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Device revoked successfully"),
                    @ApiResponse(responseCode = "404", description = "Device not found")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeDevice(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        revokeDeviceUseCase.execute(userId, id);
        return ResponseEntity.noContent().build();
    }
}