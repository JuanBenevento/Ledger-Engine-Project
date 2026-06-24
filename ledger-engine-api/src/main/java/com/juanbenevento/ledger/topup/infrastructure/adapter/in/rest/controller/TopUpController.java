package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CardTopUpUseCase;
import com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto.WebCardTopUpRequest;
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
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
@Tag(name = "TopUps", description = "Wallet top-up endpoints")
public class TopUpController {

    private final CardTopUpUseCase cardTopUpUseCase;

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
    @PostMapping("/{walletId}/topup")
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
}
