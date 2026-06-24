package com.juanbenevento.ledger.wallet.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.wallet.application.dto.WalletResponse;
import com.juanbenevento.ledger.wallet.application.port.input.CreateWalletUseCase;
import com.juanbenevento.ledger.wallet.application.port.input.GetWalletUseCase;
import com.juanbenevento.ledger.wallet.infrastructure.adapter.in.rest.dto.WebCreateWalletRequest;
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
@Tag(name = "Wallets", description = "Wallet management endpoints")
public class WalletController {

    private final CreateWalletUseCase createWalletUseCase;
    private final GetWalletUseCase getWalletUseCase;

    @Operation(
            summary = "Create a new wallet",
            description = "Provisions a new wallet with zero balance for a user.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Wallet created successfully",
                            content = @Content(schema = @Schema(implementation = WalletResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "409", description = "Wallet already exists for this user and type")
            }
    )
    @PostMapping
    public ResponseEntity<WalletResponse> create(@Valid @RequestBody WebCreateWalletRequest request) {
        var applicationRequest = new com.juanbenevento.ledger.wallet.application.dto.CreateWalletRequest(
                request.userId(),
                request.name(),
                request.currency(),
                request.walletType()
        );

        WalletResponse response = createWalletUseCase.execute(applicationRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Get wallet by ID",
            description = "Returns wallet details including current balance.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Wallet found",
                            content = @Content(schema = @Schema(implementation = WalletResponse.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Wallet not found")
            }
    )
    @GetMapping("/{walletId}")
    public ResponseEntity<WalletResponse> getById(@PathVariable UUID walletId) {
        WalletResponse response = getWalletUseCase.execute(walletId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get wallet balance",
            description = "Returns the current available balance for a wallet.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Balance retrieved",
                            content = @Content(schema = @Schema(implementation = WalletResponse.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Wallet not found")
            }
    )
    @GetMapping("/{walletId}/balance")
    public ResponseEntity<WalletResponse> getBalance(@PathVariable UUID walletId) {
        WalletResponse response = getWalletUseCase.execute(walletId);
        return ResponseEntity.ok(response);
    }
}
