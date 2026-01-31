package com.juanbenevento.ledger.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.application.ports.in.CreateAccountUseCase;
import com.juanbenevento.ledger.infrastructure.adapter.in.rest.dto.AccountRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Endpoints for managing financial accounts")
public class AccountController {
    private final CreateAccountUseCase createAccountUseCase;

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
    public ResponseEntity<CreateAccountResponse> create(@Valid @RequestBody AccountRequest request) {
        var applicationRequest = new CreateAccountRequest(
                request.accountNumber(),
                request.currency(),
                request.correlationId(),
                request.requestSource()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createAccountUseCase.execute(applicationRequest));
    }
}
