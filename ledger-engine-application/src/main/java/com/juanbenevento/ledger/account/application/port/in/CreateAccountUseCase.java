package com.juanbenevento.ledger.account.application.port.in;

import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.dto.CreateAccountResponse;

public interface CreateAccountUseCase {
    CreateAccountResponse execute(CreateAccountRequest request);
}
