package com.juanbenevento.ledger.user.application.port.input;

import com.juanbenevento.ledger.user.application.dto.KycStatusResponse;

import java.util.UUID;

public interface SubmitKycUseCase {
    KycStatusResponse execute(UUID userId);
}
