package com.juanbenevento.ledger.account.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.account.application.dto.AccountStatementResponse;
import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.account.application.port.in.CreateAccountUseCase;
import com.juanbenevento.ledger.account.application.port.in.GetAccountHistoryUseCase;
import com.juanbenevento.ledger.account.infrastructure.adapter.in.rest.dto.WebAccountRequest;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Endpoints for managing financial accounts")
public class AccountController {
    private final CreateAccountUseCase createAccountUseCase;
    private final GetAccountHistoryUseCase getAccountHistoryUseCase;

    @Operation(
            summary = "Create a new financial account",
            description = "Provisions a new account with zero balance. Supports idempotency via correlationId.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Account created successfully or existing account returned (Idempotency Case A3)",
                            content = @Content(schema = @Schema(implementation = CreateAccountResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data or business rule violation"),
                    @ApiResponse(responseCode = "409", description = "Account number already exists")
            }
    )
    @PostMapping
    public ResponseEntity<CreateAccountResponse> create(@Valid @RequestBody WebAccountRequest request) {
        var applicationRequest = new CreateAccountRequest(
                request.accountNumber(),
                request.currency(),
                request.correlationId(),
                request.requestSource()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createAccountUseCase.execute(applicationRequest));
    }

    @Operation(
            summary = "Retrieve account transaction history (Ledger Statement)",
            description = "Returns the chronological list of movements with calculated running balance. " +
                    "Ensures deterministic ordering even for high-frequency transactions.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "History retrieved successfully. Returns empty list if no movements exist.",
                            content = @Content(schema = @Schema(implementation = AccountStatementResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Account not found",
                            content = @Content(schema = @Schema(hidden = true))
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Integrity Violation: Ledger mismatch detected (Critical Error)",
                            content = @Content(schema = @Schema(hidden = true))
                    )
            }
    )
    @GetMapping("/{accountId}/history")
    public ResponseEntity<List<AccountStatementResponse>> getHistory(@PathVariable UUID accountId) {
        List<AccountStatementResponse> history = getAccountHistoryUseCase.execute(accountId);

        return ResponseEntity.ok(history);
    }
}
