package com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.dto.WebCreateTransferRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Slf4j
@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
@Tag(name = "Transfers", description = "Endpoints for executing financial transactions between accounts")
public class TransferController {

    private final TransferUseCase transferUseCase;

    @Operation(
            summary = "Execute an atomic fund transfer",
            description = "Performs a double-entry journal recording. Validates account existence, currency consistency, and available balance. Ensures idempotency via correlationId.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Transfer executed successfully. Returns transaction details and new account balances.",
                            content = @Content(schema = @Schema(implementation = TransactionResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid input format (e.g., negative amount, invalid UUIDs)"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Source or Target Account not found (AccountNotFoundException)"
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Transaction already processed with this correlationId (Idempotency)"
                    ),
                    @ApiResponse(
                            responseCode = "422",
                            description = "Business validation failed (e.g., Insufficient Funds, Account Inactive)"
                    )
            }
    )
    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody WebCreateTransferRequest webRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "ANONYMOUS_WEB") String userId
    ) {
        log.info("REST request to transfer funds: correlationId={}", webRequest.correlationId());

        CreateTransferRequest command = webRequest.toCommand(userId);

        TransactionResponse response = transferUseCase.execute(command);

        return ResponseEntity
                .created(URI.create("/api/v1/transactions/" + response.transactionId()))
                .body(response);
    }
}
