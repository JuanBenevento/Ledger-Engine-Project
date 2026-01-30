package com.juanbenevento.ledger.application.ports.in;

import com.juanbenevento.ledger.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.application.dto.CreateAccountResponse;

public interface CreateAccountUseCase {
    CreateAccountResponse execute(CreateAccountRequest request);
}
