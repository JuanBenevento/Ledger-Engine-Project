package com.juanbenevento.ledger.security.api.controller;

import com.juanbenevento.ledger.security.application.dto.DisableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.TwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.VerifyTwoFactorRequest;
import com.juanbenevento.ledger.security.application.port.input.DisableTwoFactorUseCase;
import com.juanbenevento.ledger.security.application.port.input.EnableTwoFactorUseCase;
import com.juanbenevento.ledger.security.application.port.input.VerifyTwoFactorUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SecurityController.class)
class SecurityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EnableTwoFactorUseCase enableTwoFactorUseCase;

    @MockitoBean
    private VerifyTwoFactorUseCase verifyTwoFactorUseCase;

    @MockitoBean
    private DisableTwoFactorUseCase disableTwoFactorUseCase;

    @Test
    void shouldEnableTwoFactor() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        EnableTwoFactorResponse response = new EnableTwoFactorResponse(
                userId, "JBSWY3DPEHPK3PXP", "otpauth://totp/LedgerEngine", List.of("CODE1", "CODE2"));
        when(enableTwoFactorUseCase.execute(any(EnableTwoFactorRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/security/2fa/enable")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"" + userId + "\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.secretKey").value("JBSWY3DPEHPK3PXP"))
                .andExpect(jsonPath("$.backupCodes").isArray());
    }

    @Test
    void shouldVerifyTwoFactor() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        TwoFactorResponse response = new TwoFactorResponse(userId, true, "Code verified successfully");
        when(verifyTwoFactorUseCase.execute(any(VerifyTwoFactorRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/security/2fa/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"" + userId + "\",\"code\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.message").value("Code verified successfully"));
    }

    @Test
    void shouldDisableTwoFactor() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        TwoFactorResponse response = new TwoFactorResponse(userId, false, "2FA disabled successfully");
        when(disableTwoFactorUseCase.execute(any(DisableTwoFactorRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/security/2fa/disable")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"" + userId + "\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.message").value("2FA disabled successfully"));
    }
}