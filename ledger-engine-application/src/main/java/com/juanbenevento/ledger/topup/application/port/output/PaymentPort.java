package com.juanbenevento.ledger.topup.application.port.output;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Output port for payment provider integration.
 * Implemented by infrastructure adapters (Stripe, PayU, etc.).
 */
public interface PaymentPort {

    /**
     * Process a card charge synchronously.
     * Returns the external payment reference on success.
     * Throws PaymentFailedException on failure.
     */
    String chargeCard(String cardToken, BigDecimal amount, String currency, String idempotencyKey);

    /**
     * Initiate a PSE redirect flow.
     * Returns the redirect URL for the user.
     */
    String initiatePseRedirect(BigDecimal amount, String currency, String callbackUrl, String idempotencyKey);

    /**
     * Generate a reference code for cash payments.
     * Returns the reference code (alphanumeric, 8 chars).
     */
    String generateCashReference(BigDecimal amount, String currency);
}
