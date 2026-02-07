package com.juanbenevento.ledger.account.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.account.application.port.in.UpdateAccountStatusUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "Lifecycle operations: Freeze, Activate, Close")
public class AccountStatusController {

    private final UpdateAccountStatusUseCase updateAccountStatusUseCase;

    @Operation(
            summary = "Change account operational status",
            description = "Performs a state transition (FREEZE/ACTIVATE) on the target account. " +
                    "This operation is idempotent: applying the same state twice produces no side effect.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Status updated successfully or was already in target state."
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid action or malformed request."
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Account not found."
                    )
            }
    )
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(
            @Parameter(description = "UUID of the account to modify") @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        if (request.action() == StatusUpdateRequest.Action.FREEZE) {
            updateAccountStatusUseCase.freeze(id, request.reason());
        } else {
            updateAccountStatusUseCase.activate(id);
        }

        return ResponseEntity.noContent().build();
    }

    public record StatusUpdateRequest(
            @NotNull(message = "Action is required")
            Action action,

            String reason
    ) {
        public enum Action { FREEZE, ACTIVATE }
    }
}
