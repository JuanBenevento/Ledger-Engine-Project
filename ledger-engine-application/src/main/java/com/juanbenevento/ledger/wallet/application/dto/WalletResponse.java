package com.juanbenevento.ledger.wallet.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record WalletResponse(
        UUID id,
        String name,
        String currency,
        String walletType,
        String status,
        BigDecimal availableBalance
) {
}
