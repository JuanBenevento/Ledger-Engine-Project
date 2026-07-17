package com.juanbenevento.ledger.security.application.port.input;

import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorResponse;

/**
 * Use case for enabling 2FA.
 */
public interface EnableTwoFactorUseCase {
    EnableTwoFactorResponse execute(EnableTwoFactorRequest request);
}