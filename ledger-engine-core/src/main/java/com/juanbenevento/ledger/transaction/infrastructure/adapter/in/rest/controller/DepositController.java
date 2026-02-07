package com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.DepositUseCase;
import com.juanbenevento.ledger.transaction.infrastructure.adapter.in.rest.dto.WebDepositRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/deposits")
@RequiredArgsConstructor
@Tag(name = "Cash Operations", description = "Direct cash-in operations")
public class DepositController {

    private final DepositUseCase depositUseCase;

    @Operation(
            summary = "Perform a Cash Deposit",
            description = "Injects funds into an account from the Bank's Vault. Ensures double-entry bookkeeping.",
            responses = {
                    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Account not found"),
                    @ApiResponse(responseCode = "409", description = "Idempotency conflict")
            }
    )
    @PostMapping
    public ResponseEntity<TransactionResponse> deposit(@Valid @RequestBody WebDepositRequest request) {

        TransactionResponse response = depositUseCase.execute(request.toCommand());

        return ResponseEntity
                .created(URI.create("/api/v1/transactions/" + response.transactionId()))
                .body(response);
    }
}
