package com.juanbenevento.ledger.account.application.port.in;

import java.util.UUID;

public interface UpdateAccountStatusUseCase {
    void freeze(UUID accountId, String reason);
    void activate(UUID accountId);
}
