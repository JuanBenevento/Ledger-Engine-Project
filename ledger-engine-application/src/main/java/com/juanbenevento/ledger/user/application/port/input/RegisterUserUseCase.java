package com.juanbenevento.ledger.user.application.port.input;

import com.juanbenevento.ledger.user.application.dto.RegisterUserRequest;
import com.juanbenevento.ledger.user.application.dto.RegisterUserResponse;

public interface RegisterUserUseCase {
    RegisterUserResponse execute(RegisterUserRequest request);
}
