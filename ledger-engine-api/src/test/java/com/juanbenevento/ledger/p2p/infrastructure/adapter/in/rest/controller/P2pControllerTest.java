package com.juanbenevento.ledger.p2p.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.p2p.application.dto.P2pTransferResponse;
import com.juanbenevento.ledger.p2p.application.port.input.SendMoneyUseCase;
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

@WebMvcTest(P2pController.class)
class P2pControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SendMoneyUseCase sendMoneyUseCase;

    @Test
    @DisplayName("US-15: POST /api/v1/p2p/transfers should return 201 with transfer data")
    void shouldSendMoney() throws Exception {
        P2pTransferResponse response = new P2pTransferResponse(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("50000.00"), "COP", "COMPLETED", "Lunch money",
                LocalDateTime.now(), LocalDateTime.now());

        given(sendMoneyUseCase.execute(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/p2p/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "recipientIdentifier": "recipient@test.com",
                                    "lookupType": "EMAIL",
                                    "amount": 50000.00,
                                    "currency": "COP",
                                    "note": "Lunch money"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(50000.00))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.note").value("Lunch money"));
    }

    @Test
    @DisplayName("US-15: POST /api/v1/p2p/transfers should return 400 for missing recipient")
    void shouldReturn400ForMissingRecipient() throws Exception {
        mockMvc.perform(post("/api/v1/p2p/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "lookupType": "EMAIL",
                                    "amount": 50000.00,
                                    "currency": "COP"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("US-15: POST /api/v1/p2p/transfers should return 400 for invalid lookupType")
    void shouldReturn400ForInvalidLookupType() throws Exception {
        mockMvc.perform(post("/api/v1/p2p/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "recipientIdentifier": "recipient@test.com",
                                    "lookupType": "INVALID",
                                    "amount": 50000.00,
                                    "currency": "COP"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
