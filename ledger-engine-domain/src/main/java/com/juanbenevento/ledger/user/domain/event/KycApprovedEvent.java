package com.juanbenevento.ledger.user.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event emitted when KYC is approved for a user.
 * Triggers automatic wallet creation.
 */
public record KycApprovedEvent(
        UUID userId,
        String emailAddress,
        LocalDateTime occurredAt
) {
    public static KycApprovedEvent of(UUID userId, String emailAddress) {
        return new KycApprovedEvent(userId, emailAddress, LocalDateTime.now());
    }
}
