package com.juanbenevento.ledger.wallet.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record WebCreateWalletRequest(
        @Schema(description = "User ID who owns the wallet")
        UUID userId,

        @Schema(example = "Mi Billetera", description = "Wallet display name")
        @NotBlank
        String name,

        @Schema(example = "COP", description = "ISO-4217 currency code")
        @NotBlank @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @Schema(example = "PRIMARY", description = "Wallet type: PRIMARY or SECONDARY")
        @NotBlank @Pattern(regexp = "^(PRIMARY|SECONDARY)$")
        String walletType
) {
}
