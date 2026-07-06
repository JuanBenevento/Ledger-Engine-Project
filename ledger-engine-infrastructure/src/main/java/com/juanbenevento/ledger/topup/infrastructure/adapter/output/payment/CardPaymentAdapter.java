package com.juanbenevento.ledger.topup.infrastructure.adapter.output.payment;

import com.juanbenevento.ledger.topup.application.port.output.PaymentPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Mock payment adapter simulating Stripe/PayU card processing.
 * In production, this would integrate with a real payment gateway.
 * Handles PCI-DSS tokenization via external provider (tokens only, no raw card data).
 */
@Slf4j
@Component
public class CardPaymentAdapter implements PaymentPort {

    @Override
    public String chargeCard(String cardToken, BigDecimal amount, String currency, String idempotencyKey) {
        log.info("Mock: Charging card token={} amount={} {} idempotencyKey={}",
                maskToken(cardToken), amount, currency, idempotencyKey);

        // Simulate payment processing
        if (cardToken == null || cardToken.isBlank()) {
            throw new IllegalArgumentException("Card token must not be blank");
        }

        String externalReference = "CHG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Mock: Card charge successful. externalReference={}", externalReference);
        return externalReference;
    }

    @Override
    public String initiatePseRedirect(BigDecimal amount, String currency, String callbackUrl, String idempotencyKey) {
        log.info("Mock: Initiating PSE redirect amount={} {} callbackUrl={}", amount, currency, callbackUrl);
        return "https://mock-pse-gateway.com/pay/" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    public String generateCashReference(BigDecimal amount, String currency) {
        log.info("Mock: Generating cash reference amount={} {}", amount, currency);
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String maskToken(String token) {
        if (token == null || token.length() < 8) return "****";
        return token.substring(0, 4) + "****" + token.substring(token.length() - 4);
    }
}
