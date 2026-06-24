package com.juanbenevento.ledger.user.application.dto;

import java.util.UUID;

public record WalletInfo(
        UUID walletId,
        String walletType,
        String currency
) {
}
