package com.juanbenevento.ledger.security.application.port.input;

import com.juanbenevento.ledger.security.application.dto.DisableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.TwoFactorResponse;

/**
 * Use case for disabling 2FA.
 */
public interface DisableTwoFactorUseCase {
    TwoFactorResponse execute(DisableTwoFactorRequest request);
}