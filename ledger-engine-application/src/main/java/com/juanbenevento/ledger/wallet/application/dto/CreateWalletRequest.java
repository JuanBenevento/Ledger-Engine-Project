package com.juanbenevento.ledger.wallet.application.dto;

import java.util.UUID;

public record CreateWalletRequest(
        UUID userId,
        String name,
        String currency,
        String walletType
) {
}
