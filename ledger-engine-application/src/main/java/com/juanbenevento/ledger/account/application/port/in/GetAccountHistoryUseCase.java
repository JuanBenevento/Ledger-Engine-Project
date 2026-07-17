package com.juanbenevento.ledger.account.application.port.in;

import com.juanbenevento.ledger.account.application.dto.AccountStatementResponse;

import java.util.List;
import java.util.UUID;

public interface GetAccountHistoryUseCase {
    List<AccountStatementResponse> execute(UUID accountId);
}
