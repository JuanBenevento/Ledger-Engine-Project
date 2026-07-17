package com.juanbenevento.ledger.user.application.port.output;

import com.juanbenevento.ledger.user.application.dto.WalletInfo;

import java.util.UUID;

/**
 * Output port for wallet creation.
 * Implemented by the account/wallet infrastructure adapter.
 */
public interface WalletCreationPort {
    WalletInfo createPrimaryWallet(UUID userId, String correlationId);
}
