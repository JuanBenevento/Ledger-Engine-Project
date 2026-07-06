package com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.user.application.dto.RegisterUserResponse;
import com.juanbenevento.ledger.user.application.port.input.RegisterUserUseCase;
import com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.dto.WebRegisterUserRequest;
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

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and authentication endpoints")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account with encrypted PII. User starts with PENDING_KYC status.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "User registered successfully",
                            content = @Content(schema = @Schema(implementation = RegisterUserResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "409", description = "Email or phone already registered")
            }
    )
    @PostMapping("/register")
    public ResponseEntity<RegisterUserResponse> register(@Valid @RequestBody WebRegisterUserRequest request) {
        var applicationRequest = new com.juanbenevento.ledger.user.application.dto.RegisterUserRequest(
                request.emailAddress(),
                request.phoneNumber(),
                request.firstName(),
                request.lastName()
        );

        RegisterUserResponse response = registerUserUseCase.execute(applicationRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
