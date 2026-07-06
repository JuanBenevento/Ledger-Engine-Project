package com.juanbenevento.ledger.user.application.port.input;

import com.juanbenevento.ledger.user.application.dto.KycApprovedResponse;

import java.util.UUID;

public interface ApproveKycUseCase {
    KycApprovedResponse execute(UUID userId);
}
