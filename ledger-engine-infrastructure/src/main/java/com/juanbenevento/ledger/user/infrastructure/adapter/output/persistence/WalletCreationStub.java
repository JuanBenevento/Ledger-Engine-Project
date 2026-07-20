package com.juanbenevento.ledger.user.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.user.application.dto.WalletInfo;
import com.juanbenevento.ledger.user.application.port.output.WalletCreationPort;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * TODO: Replace with real wallet creation when the account module is ready.
 */
@Component
public class WalletCreationStub implements WalletCreationPort {
    @Override
    public WalletInfo createPrimaryWallet(UUID userId, String correlationId) {
        throw new UnsupportedOperationException("Wallet creation not yet implemented");
    }
}
