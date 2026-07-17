package com.juanbenevento.ledger.transaction.application.port.in;

import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;


public interface TransferUseCase {
    TransactionResponse execute(CreateTransferRequest request);
}
