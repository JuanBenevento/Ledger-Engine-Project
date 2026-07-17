package com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.user.application.dto.KycApprovedResponse;
import com.juanbenevento.ledger.user.application.dto.KycStatusResponse;
import com.juanbenevento.ledger.user.application.dto.WalletInfo;
import com.juanbenevento.ledger.user.application.port.input.ApproveKycUseCase;
import com.juanbenevento.ledger.user.application.port.input.SubmitKycUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(KycController.class)
class KycControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SubmitKycUseCase submitKycUseCase;

    @MockitoBean
    private ApproveKycUseCase approveKycUseCase;

    @Test
    @DisplayName("US-08: POST /api/v1/users/{id}/kyc should return 200 with KYC_SUBMITTED")
    void shouldSubmitKyc() throws Exception {
        given(submitKycUseCase.execute(any())).willReturn(new KycStatusResponse("KYC_SUBMITTED"));

        mockMvc.perform(post("/api/v1/users/{userId}/kyc", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("KYC_SUBMITTED"));
    }

    @Test
    @DisplayName("US-08: POST /api/v1/users/{id}/kyc/approve should return 200 with wallet info")
    void shouldApproveKyc() throws Exception {
        given(approveKycUseCase.execute(any())).willReturn(
                new KycApprovedResponse("ACTIVE", new WalletInfo(UUID.randomUUID(), "PRIMARY", "COP")));

        mockMvc.perform(post("/api/v1/users/{userId}/kyc/approve", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.wallet.walletType").value("PRIMARY"));
    }
}
