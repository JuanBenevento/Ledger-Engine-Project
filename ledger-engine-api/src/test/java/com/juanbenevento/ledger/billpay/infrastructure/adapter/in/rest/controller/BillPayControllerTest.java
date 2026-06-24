package com.juanbenevento.ledger.billpay.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.billpay.application.dto.BillPaymentResponse;
import com.juanbenevento.ledger.billpay.application.port.input.PayBillUseCase;
import com.juanbenevento.ledger.billpay.domain.model.Biller;
import com.juanbenevento.ledger.billpay.domain.port.BillerRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillPayController.class)
class BillPayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PayBillUseCase payBillUseCase;

    @MockitoBean
    private BillerRepository billerRepository;

    @Test
    @DisplayName("US-19: POST /api/v1/bills/pay should return 201 with payment data")
    void shouldPayBill() throws Exception {
        BillPaymentResponse response = new BillPaymentResponse(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("150000.00"), "COP", "REF-001", "COMPLETED", "Provider accepted",
                LocalDateTime.now(), LocalDateTime.now());

        given(payBillUseCase.execute(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/bills/pay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "walletId": "11111111-1111-1111-1111-111111111111",
                                    "userId": "22222222-2222-2222-2222-222222222222",
                                    "billerId": "33333333-3333-3333-3333-333333333333",
                                    "amount": 150000.00,
                                    "currency": "COP",
                                    "reference": "REF-001"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(150000.00))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.reference").value("REF-001"));
    }

    @Test
    @DisplayName("US-19: POST /api/v1/bills/pay should return 400 for missing billerId")
    void shouldReturn400ForMissingBillerId() throws Exception {
        mockMvc.perform(post("/api/v1/bills/pay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "walletId": "11111111-1111-1111-1111-111111111111",
                                    "userId": "22222222-2222-2222-2222-222222222222",
                                    "amount": 150000.00,
                                    "currency": "COP",
                                    "reference": "REF-001"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("US-19: GET /api/v1/bills/favorites should return 200 with biller list")
    void shouldGetFavoriteBillers() throws Exception {
        List<Biller> billers = List.of(
                Biller.create(UUID.randomUUID(), "EPM", "UTILITIES", "1234567890"),
                Biller.create(UUID.randomUUID(), "ETB", "TELECOM", "0987654321")
        );

        when(billerRepository.findAllActive()).thenReturn(billers);

        mockMvc.perform(get("/api/v1/bills/favorites")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("EPM"))
                .andExpect(jsonPath("$[1].name").value("ETB"));
    }
}
