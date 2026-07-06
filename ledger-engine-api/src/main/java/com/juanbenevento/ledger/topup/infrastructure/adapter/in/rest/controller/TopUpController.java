package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CardTopUpUseCase;
import com.juanbenevento.ledger.topup.application.port.input.CashTopUpUseCase;
import com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto.WebCardTopUpRequest;
import com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto.WebCashTopUpRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "TopUps", description = "Wallet top-up endpoints")
public class TopUpController {

    private final CardTopUpUseCase cardTopUpUseCase;
    private final CashTopUpUseCase cashTopUpUseCase;

    @Operation(
            summary = "Top up wallet with card",
            description = "Processes a card-based top-up synchronously. " +
                    "Card data is tokenized via PCI-DSS compliant provider.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Top-up completed successfully",
                            content = @Content(schema = @Schema(implementation = TopUpResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "404", description = "Wallet not found"),
                    @ApiResponse(responseCode = "422", description = "Payment declined or insufficient funds")
            }
    )
    @PostMapping("/wallets/{walletId}/topup")
    public ResponseEntity<TopUpResponse> topUp(
            @PathVariable UUID walletId,
            @Valid @RequestBody WebCardTopUpRequest request) {

        String correlationId = request.correlationId() != null
                ? request.correlationId()
                : "TOPUP-" + UUID.randomUUID();

        var command = new CardTopUpUseCase.CardTopUpCommand(
                walletId,
                UUID.randomUUID(), // In production: extracted from JWT
                request.amount(),
                request.currency(),
                request.cardToken(),
                correlationId
        );

        TopUpResponse response = cardTopUpUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Initiate cash top-up",
            description = "Creates a cash top-up with 8-character reference code. " +
                    "User must pay at a cash point within 24 hours.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Cash top-up initiated with reference code",
                            content = @Content(schema = @Schema(implementation = TopUpResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "404", description = "Wallet not found")
            }
    )
    @PostMapping("/wallets/{walletId}/topup/cash")
    public ResponseEntity<TopUpResponse> initiateCashTopUp(
            @PathVariable UUID walletId,
            @Valid @RequestBody WebCashTopUpRequest request) {

        String correlationId = request.correlationId() != null
                ? request.correlationId()
                : "TOPUP-CASH-" + UUID.randomUUID();

        var command = new CashTopUpUseCase.CashTopUpCommand(
                walletId,
                UUID.randomUUID(), // In production: extracted from JWT
                request.amount(),
                request.currency(),
                correlationId
        );

        TopUpResponse response = cashTopUpUseCase.initiate(command);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Confirm cash top-up",
            description = "Confirms a cash top-up after payment at a cash point. " +
                    "Must be within 24 hours of initiation.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Cash top-up confirmed and wallet credited",
                            content = @Content(schema = @Schema(implementation = TopUpResponse.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Top-up not found"),
                    @ApiResponse(responseCode = "422", description = "Top-up expired or already processed")
            }
    )
    @PostMapping("/topups/{topUpId}/confirm")
    public ResponseEntity<TopUpResponse> confirmCashTopUp(@PathVariable UUID topUpId) {
        TopUpResponse response = cashTopUpUseCase.confirm(topUpId);
        return ResponseEntity.ok(response);
    }
}
