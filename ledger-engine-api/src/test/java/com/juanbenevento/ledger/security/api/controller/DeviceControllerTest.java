package com.juanbenevento.ledger.security.api.controller;

import com.juanbenevento.ledger.security.application.dto.DeviceResponse;
import com.juanbenevento.ledger.security.application.dto.RegisterDeviceRequest;
import com.juanbenevento.ledger.security.application.port.input.ListDevicesUseCase;
import com.juanbenevento.ledger.security.application.port.input.RegisterDeviceUseCase;
import com.juanbenevento.ledger.security.application.port.input.RevokeDeviceUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeviceController.class)
class DeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegisterDeviceUseCase registerDeviceUseCase;

    @MockitoBean
    private ListDevicesUseCase listDevicesUseCase;

    @MockitoBean
    private RevokeDeviceUseCase revokeDeviceUseCase;

    @Test
    void shouldRegisterDevice() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        DeviceResponse response = new DeviceResponse(
                UUID.randomUUID(), userId, "iPhone 15", "abc123def456",
                null, true, Instant.now());
        when(registerDeviceUseCase.execute(any(RegisterDeviceRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/security/devices")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"" + userId + "\",\"deviceName\":\"iPhone 15\",\"deviceFingerprint\":\"abc123def456\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deviceName").value("iPhone 15"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void shouldListDevices() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        DeviceResponse device1 = new DeviceResponse(
                UUID.randomUUID(), userId, "iPhone 15", "abc123",
                null, true, Instant.now());
        DeviceResponse device2 = new DeviceResponse(
                UUID.randomUUID(), userId, "Samsung Galaxy", "xyz789",
                null, true, Instant.now());
        when(listDevicesUseCase.execute(userId)).thenReturn(List.of(device1, device2));

        // When & Then
        mockMvc.perform(get("/api/v1/security/devices")
                .param("userId", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].deviceName").value("iPhone 15"))
                .andExpect(jsonPath("$[1].deviceName").value("Samsung Galaxy"));
    }

    @Test
    void shouldRevokeDevice() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UUID deviceId = UUID.randomUUID();
        doNothing().when(revokeDeviceUseCase).execute(userId, deviceId);

        // When & Then
        mockMvc.perform(delete("/api/v1/security/devices/" + deviceId)
                .param("userId", userId.toString()))
                .andExpect(status().isNoContent());
    }
}