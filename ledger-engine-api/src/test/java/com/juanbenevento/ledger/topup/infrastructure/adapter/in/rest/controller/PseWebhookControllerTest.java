package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.topup.application.port.input.PseTopUpUseCase;
import com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto.PseWebhookCallback;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PseWebhookController.class)
@TestPropertySource(properties = "webhook.hmac.secret=test-secret-key-for-hmac")
class PseWebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PseTopUpUseCase pseTopUpUseCase;

    private static final String TEST_HMAC_SECRET = "test-secret-key-for-hmac";

    private String generateSignature(String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(TEST_HMAC_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    @Test
    @DisplayName("US-12: POST /api/v1/webhooks/topup/pse should process valid callback")
    void shouldProcessValidCallback() throws Exception {
        String payload = "EXT-REF-123|true|";
        String signature = generateSignature(payload);

        mockMvc.perform(post("/api/v1/webhooks/topup/pse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "externalReference": "EXT-REF-123",
                                    "success": true,
                                    "failureReason": null,
                                    "signature": "%s"
                                }
                                """.formatted(signature)))
                .andExpect(status().isOk());

        verify(pseTopUpUseCase).confirmCallback("EXT-REF-123", true, null);
    }

    @Test
    @DisplayName("US-12: POST /api/v1/webhooks/topup/pse should reject invalid signature")
    void shouldRejectInvalidSignature() throws Exception {
        mockMvc.perform(post("/api/v1/webhooks/topup/pse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "externalReference": "EXT-REF-123",
                                    "success": true,
                                    "failureReason": null,
                                    "signature": "invalid-signature"
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(pseTopUpUseCase, never()).confirmCallback(anyString(), anyBoolean(), anyString());
    }

    @Test
    @DisplayName("US-12: POST /api/v1/webhooks/topup/pse should handle failed callback")
    void shouldHandleFailedCallback() throws Exception {
        String payload = "EXT-REF-456|false|INSUFFICIENT_FUNDS";
        String signature = generateSignature(payload);

        mockMvc.perform(post("/api/v1/webhooks/topup/pse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "externalReference": "EXT-REF-456",
                                    "success": false,
                                    "failureReason": "INSUFFICIENT_FUNDS",
                                    "signature": "%s"
                                }
                                """.formatted(signature)))
                .andExpect(status().isOk());

        verify(pseTopUpUseCase).confirmCallback("EXT-REF-456", false, "INSUFFICIENT_FUNDS");
    }
}
