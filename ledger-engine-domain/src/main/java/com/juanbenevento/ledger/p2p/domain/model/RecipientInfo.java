package com.juanbenevento.ledger.p2p.domain.model;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a resolved P2P transfer recipient.
 */
public record RecipientInfo(
        UUID userId,
        UUID walletId,
        String displayName,
        String currency
) {
    public RecipientInfo {
        Objects.requireNonNull(userId, "Recipient user ID must not be null");
        Objects.requireNonNull(walletId, "Recipient wallet ID must not be null");
    }
}
