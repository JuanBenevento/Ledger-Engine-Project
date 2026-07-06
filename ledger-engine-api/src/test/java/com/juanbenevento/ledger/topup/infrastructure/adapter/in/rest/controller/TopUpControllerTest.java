package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CardTopUpUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TopUpController.class)
class TopUpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CardTopUpUseCase cardTopUpUseCase;

    @Test
    @DisplayName("US-11: POST /api/v1/wallets/{id}/topup should return 201 with top-up data")
    void shouldProcessTopUp() throws Exception {
        UUID walletId = UUID.randomUUID();
        TopUpResponse response = new TopUpResponse(
                UUID.randomUUID(), walletId, new BigDecimal("50000.00"),
                "COP", "CARD", "COMPLETED", null,
                LocalDateTime.now(), LocalDateTime.now());

        given(cardTopUpUseCase.execute(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/wallets/{walletId}/topup", walletId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 50000.00,
                                    "currency": "COP",
                                    "cardToken": "tok_visa_4242424242424242"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(50000.00))
                .andExpect(jsonPath("$.method").value("CARD"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("US-11: POST /api/v1/wallets/{id}/topup should return 400 for missing amount")
    void shouldReturn400ForMissingAmount() throws Exception {
        UUID walletId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/wallets/{walletId}/topup", walletId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "currency": "COP",
                                    "cardToken": "tok_visa_4242"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("US-11: POST /api/v1/wallets/{id}/topup should return 400 for missing cardToken")
    void shouldReturn400ForMissingCardToken() throws Exception {
        UUID walletId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/wallets/{walletId}/topup", walletId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 50000.00,
                                    "currency": "COP"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
