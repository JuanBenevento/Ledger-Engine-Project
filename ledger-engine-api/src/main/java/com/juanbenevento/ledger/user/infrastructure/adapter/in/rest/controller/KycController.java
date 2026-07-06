package com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.user.application.dto.KycApprovedResponse;
import com.juanbenevento.ledger.user.application.dto.KycStatusResponse;
import com.juanbenevento.ledger.user.application.port.input.ApproveKycUseCase;
import com.juanbenevento.ledger.user.application.port.input.SubmitKycUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "KYC", description = "Know Your Customer verification endpoints")
public class KycController {

    private final SubmitKycUseCase submitKycUseCase;
    private final ApproveKycUseCase approveKycUseCase;

    @Operation(
            summary = "Submit KYC for verification",
            description = "Transitions user from PENDING_KYC to KYC_SUBMITTED.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "KYC submitted successfully",
                            content = @Content(schema = @Schema(implementation = KycStatusResponse.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "User not found"),
                    @ApiResponse(responseCode = "422", description = "Invalid status transition")
            }
    )
    @PostMapping("/{userId}/kyc")
    public ResponseEntity<KycStatusResponse> submitKyc(@PathVariable UUID userId) {
        KycStatusResponse response = submitKycUseCase.execute(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Approve KYC and activate user",
            description = "Approves KYC, activates user, and auto-creates PRIMARY wallet.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "KYC approved, user activated, wallet created",
                            content = @Content(schema = @Schema(implementation = KycApprovedResponse.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "User not found"),
                    @ApiResponse(responseCode = "422", description = "Invalid status transition")
            }
    )
    @PostMapping("/{userId}/kyc/approve")
    public ResponseEntity<KycApprovedResponse> approveKyc(@PathVariable UUID userId) {
        KycApprovedResponse response = approveKycUseCase.execute(userId);
        return ResponseEntity.ok(response);
    }
}
