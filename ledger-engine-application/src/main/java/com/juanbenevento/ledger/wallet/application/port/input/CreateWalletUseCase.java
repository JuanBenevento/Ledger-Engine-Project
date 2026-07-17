package com.juanbenevento.ledger.wallet.application.port.input;

import com.juanbenevento.ledger.wallet.application.dto.CreateWalletRequest;
import com.juanbenevento.ledger.wallet.application.dto.WalletResponse;

import java.util.UUID;

public interface CreateWalletUseCase {
    WalletResponse execute(CreateWalletRequest request);
}
