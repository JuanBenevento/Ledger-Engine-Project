package com.juanbenevento.ledger.p2p.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.p2p.application.dto.P2pTransferResponse;
import com.juanbenevento.ledger.p2p.application.port.input.SendMoneyUseCase;
import com.juanbenevento.ledger.p2p.infrastructure.adapter.in.rest.dto.WebSendMoneyRequest;
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
@RequestMapping("/api/v1/p2p")
@RequiredArgsConstructor
@Tag(name = "P2P Transfers", description = "Peer-to-peer money transfer endpoints")
public class P2pController {

    private final SendMoneyUseCase sendMoneyUseCase;

    @Operation(
            summary = "Send money to another user",
            description = "Transfers funds from sender's wallet to recipient's wallet. " +
                    "Recipient can be identified by email, phone, or QR code. " +
                    "Daily transfer limit applies.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Transfer completed successfully",
                            content = @Content(schema = @Schema(implementation = P2pTransferResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "404", description = "Sender or recipient not found"),
                    @ApiResponse(responseCode = "422", description = "Insufficient funds or daily limit exceeded")
            }
    )
    @PostMapping("/transfers")
    public ResponseEntity<P2pTransferResponse> sendMoney(
            @Valid @RequestBody WebSendMoneyRequest request) {

        String correlationId = request.correlationId() != null
                ? request.correlationId()
                : "P2P-" + UUID.randomUUID();

        var command = new SendMoneyUseCase.SendMoneyCommand(
                UUID.randomUUID(), // In production: extracted from JWT
                UUID.randomUUID(), // In production: extracted from JWT
                request.recipientIdentifier(),
                request.lookupType(),
                request.amount(),
                request.currency(),
                request.note(),
                correlationId
        );

        P2pTransferResponse response = sendMoneyUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
