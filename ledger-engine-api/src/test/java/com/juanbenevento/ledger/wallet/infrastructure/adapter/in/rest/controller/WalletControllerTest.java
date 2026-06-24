package com.juanbenevento.ledger.wallet.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.wallet.application.dto.WalletResponse;
import com.juanbenevento.ledger.wallet.application.port.input.CreateWalletUseCase;
import com.juanbenevento.ledger.wallet.application.port.input.GetWalletUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WalletController.class)
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateWalletUseCase createWalletUseCase;

    @MockitoBean
    private GetWalletUseCase getWalletUseCase;

    @Test
    @DisplayName("US-09: POST /api/v1/wallets should return 201 with wallet data")
    void shouldCreateWallet() throws Exception {
        WalletResponse response = new WalletResponse(
                UUID.randomUUID(), "My Wallet", "COP", "PRIMARY", "ACTIVE", BigDecimal.ZERO);

        given(createWalletUseCase.execute(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/wallets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "userId": "550e8400-e29b-41d4-a716-446655440000",
                                    "name": "My Wallet",
                                    "currency": "COP",
                                    "walletType": "PRIMARY"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("My Wallet"))
                .andExpect(jsonPath("$.walletType").value("PRIMARY"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("US-09: GET /api/v1/wallets/{id} should return wallet")
    void shouldGetWallet() throws Exception {
        UUID walletId = UUID.randomUUID();
        WalletResponse response = new WalletResponse(
                walletId, "Test Wallet", "USD", "SECONDARY", "ACTIVE", new BigDecimal("1000.00"));

        given(getWalletUseCase.execute(walletId)).willReturn(response);

        mockMvc.perform(get("/api/v1/wallets/{walletId}", walletId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(walletId.toString()))
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    @DisplayName("US-09: GET /api/v1/wallets/{id}/balance should return balance")
    void shouldGetBalance() throws Exception {
        UUID walletId = UUID.randomUUID();
        WalletResponse response = new WalletResponse(
                walletId, "Balance Wallet", "COP", "PRIMARY", "ACTIVE", new BigDecimal("50000.00"));

        given(getWalletUseCase.execute(walletId)).willReturn(response);

        mockMvc.perform(get("/api/v1/wallets/{walletId}/balance", walletId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableBalance").value(50000.00));
    }
}
