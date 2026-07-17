package com.juanbenevento.ledger.wallet.application.port.input;

import com.juanbenevento.ledger.wallet.application.dto.WalletResponse;

import java.util.UUID;

public interface GetWalletUseCase {
    WalletResponse execute(UUID walletId);
}
