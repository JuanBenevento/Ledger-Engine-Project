package com.juanbenevento.ledger.security.api.controller;

import com.juanbenevento.ledger.security.application.dto.DisableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.TwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.VerifyTwoFactorRequest;
import com.juanbenevento.ledger.security.application.port.input.DisableTwoFactorUseCase;
import com.juanbenevento.ledger.security.application.port.input.EnableTwoFactorUseCase;
import com.juanbenevento.ledger.security.application.port.input.VerifyTwoFactorUseCase;
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
@RequestMapping("/api/v1/security")
@RequiredArgsConstructor
@Tag(name = "Security", description = "2FA and security management endpoints")
public class SecurityController {

    private final EnableTwoFactorUseCase enableTwoFactorUseCase;
    private final VerifyTwoFactorUseCase verifyTwoFactorUseCase;
    private final DisableTwoFactorUseCase disableTwoFactorUseCase;

    @Operation(
            summary = "Enable 2FA for a user",
            description = "Generates a secret key and QR code URI for setting up 2FA in an authenticator app.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "2FA enabled successfully",
                            content = @Content(schema = @Schema(implementation = EnableTwoFactorResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "409", description = "2FA is already enabled")
            }
    )
    @PostMapping("/2fa/enable")
    public ResponseEntity<EnableTwoFactorResponse> enableTwoFactor(
            @Valid @RequestBody EnableTwoFactorRequest request) {
        EnableTwoFactorResponse response = enableTwoFactorUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Verify a 2FA code",
            description = "Verifies a TOTP code or backup code for a user.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Code verified successfully",
                            content = @Content(schema = @Schema(implementation = TwoFactorResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid code"),
                    @ApiResponse(responseCode = "404", description = "2FA not enabled")
            }
    )
    @PostMapping("/2fa/verify")
    public ResponseEntity<TwoFactorResponse> verifyTwoFactor(
            @Valid @RequestBody VerifyTwoFactorRequest request) {
        TwoFactorResponse response = verifyTwoFactorUseCase.execute(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Disable 2FA",
            description = "Disables 2FA for a user. Requires password verification.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "2FA disabled successfully",
                            content = @Content(schema = @Schema(implementation = TwoFactorResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid password"),
                    @ApiResponse(responseCode = "404", description = "2FA not enabled")
            }
    )
    @PostMapping("/2fa/disable")
    public ResponseEntity<TwoFactorResponse> disableTwoFactor(
            @Valid @RequestBody DisableTwoFactorRequest request) {
        TwoFactorResponse response = disableTwoFactorUseCase.execute(request);
        return ResponseEntity.ok(response);
    }
}