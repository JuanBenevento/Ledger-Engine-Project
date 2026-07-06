package com.juanbenevento.ledger.wallet.application.port.output;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Output port for wallet balance caching.
 * Implemented by the infrastructure adapter (Redis).
 */
public interface WalletBalanceCachePort {
    Optional<BigDecimal> getCachedBalance(UUID walletId);
    void cacheBalance(UUID walletId, BigDecimal balance);
    void invalidateBalance(UUID walletId);
}
