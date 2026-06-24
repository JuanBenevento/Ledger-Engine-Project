package com.juanbenevento.ledger.p2p.application.port.input;

import com.juanbenevento.ledger.p2p.application.dto.P2pTransferResponse;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Use case for sending money via P2P transfer.
 * Wraps the existing TransferUseCase for double-entry ledger mechanics.
 */
public interface SendMoneyUseCase {
    P2pTransferResponse execute(SendMoneyCommand command);

    record SendMoneyCommand(
            UUID senderWalletId,
            UUID senderUserId,
            String recipientIdentifier,
            String lookupType,
            BigDecimal amount,
            String currency,
            String note,
            String correlationId
    ) {}
}
