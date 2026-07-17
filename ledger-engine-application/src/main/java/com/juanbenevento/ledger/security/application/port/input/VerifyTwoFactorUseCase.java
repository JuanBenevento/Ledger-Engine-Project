package com.juanbenevento.ledger.security.application.port.input;

import com.juanbenevento.ledger.security.application.dto.TwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.VerifyTwoFactorRequest;

/**
 * Use case for verifying a 2FA code.
 */
public interface VerifyTwoFactorUseCase {
    TwoFactorResponse execute(VerifyTwoFactorRequest request);
}