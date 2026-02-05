package com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.common.domain.exception.InsufficientFundsException;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import com.juanbenevento.ledger.transaction.domain.exception.TransactionAlreadyProcessedException;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;
import com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.dto.WebCreateTransferRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransferController.class)
public class TransferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private TransferUseCase transferUseCase;

    private final UUID SOURCE_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final UUID TARGET_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private final UUID TX_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

    @Test
    @DisplayName("201 Created: Should deserialize request, execute use case, and serialize response correctly")
    void shouldCreateTransferSuccessfully() throws Exception {
        WebCreateTransferRequest webRequest = new WebCreateTransferRequest(
                SOURCE_ID,
                TARGET_ID,
                new BigDecimal("100.5000"),
                "USD",
                "Payment test",
                "corr-001"
        );

        TransactionResponse mockResponse = new TransactionResponse(
                TX_ID,
                "corr-001",
                TransactionType.TRANSFER,
                "COMPLETED",
                LocalDateTime.of(2025, 10, 5, 12, 0, 0),
                new BigDecimal("100.5000"), // El monto transferido
                "USD",
                "Payment test",
                new BigDecimal("900.0000"), // Nuevo saldo origen
                new BigDecimal("200.0000")  // Nuevo saldo destino
        );

        given(transferUseCase.execute(any(CreateTransferRequest.class)))
                .willReturn(mockResponse);

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(webRequest)))
                .andExpect(status().isCreated())

                .andExpect(header().string("Location", "/api/v1/transactions/" + TX_ID))

                .andExpect(jsonPath("$.transaction_id").value(TX_ID.toString()))
                .andExpect(jsonPath("$.correlation_id").value("corr-001"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))

                .andExpect(jsonPath("$.amount").value("100.5000"))
                .andExpect(jsonPath("$.source_new_balance").value("900.0000"))
                .andExpect(jsonPath("$.target_new_balance").value("200.0000"));
    }

    @Test
    @DisplayName("400 Bad Request: Should handle validation errors (e.g., negative amount)")
    void shouldReturnBadRequestOnValidationFailure() throws Exception {
        WebCreateTransferRequest invalidRequest = new WebCreateTransferRequest(
                SOURCE_ID, TARGET_ID, new BigDecimal("-10.00"), "USD", "Fail", "corr-bad"
        );

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("LE_VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details.amount").exists()); // Debe mencionar el campo que falló
    }

    @Test
    @DisplayName("409 Conflict: Should map Idempotency Exception to 409")
    void shouldReturnConflictOnDuplicate() throws Exception {
        WebCreateTransferRequest request = new WebCreateTransferRequest(
                SOURCE_ID, TARGET_ID, BigDecimal.TEN, "USD", "Dup", "corr-dup"
        );

        given(transferUseCase.execute(any()))
                .willThrow(new TransactionAlreadyProcessedException("corr-dup"));

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("LE_TRANSACTION_DUPLICATE")) // O el código que hayas definido
                .andExpect(jsonPath("$.details.correlationId").value("corr-dup"));
    }

    @Test
    @DisplayName("422 Unprocessable Entity: Should map Business Exceptions (e.g. Insufficient Funds)")
    void shouldReturn422OnBusinessError() throws Exception {
        WebCreateTransferRequest request = new WebCreateTransferRequest(
                SOURCE_ID, TARGET_ID, new BigDecimal("999999"), "USD", "Poor", "corr-poor"
        );

        InsufficientFundsException exception = new InsufficientFundsException(
                SOURCE_ID, new BigDecimal("10.00"), new BigDecimal("999999")
        );

        given(transferUseCase.execute(any())).willThrow(exception);

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("LE_INSUFFICIENT_FUNDS"));
    }
}
