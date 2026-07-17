package com.juanbenevento.ledger.wallet.infrastructure.adapter.output.cache;

import com.juanbenevento.ledger.wallet.application.port.output.WalletBalanceCachePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Redis-based wallet balance cache adapter.
 * Cache-aside pattern: check cache first, fall back to DB.
 * 10-second TTL with write invalidation.
 */
@Slf4j
@Component
public class WalletBalanceCacheAdapter implements WalletBalanceCachePort {

    private final StringRedisTemplate redisTemplate;
    private static final String BALANCE_PREFIX = "wallet:balance:";
    private static final Duration TTL = Duration.ofSeconds(10);

    public WalletBalanceCacheAdapter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Optional<BigDecimal> getCachedBalance(UUID walletId) {
        String key = BALANCE_PREFIX + walletId;
        try {
            String value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                log.debug("Cache hit for wallet balance: walletId={}", walletId);
                return Optional.of(new BigDecimal(value));
            }
            log.debug("Cache miss for wallet balance: walletId={}", walletId);
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Redis cache read error for walletId={}: {}", walletId, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void cacheBalance(UUID walletId, BigDecimal balance) {
        String key = BALANCE_PREFIX + walletId;
        try {
            redisTemplate.opsForValue().set(key, balance.toPlainString(), TTL);
            log.debug("Cached wallet balance: walletId={}, balance={}", walletId, balance);
        } catch (Exception e) {
            log.warn("Redis cache write error for walletId={}: {}", walletId, e.getMessage());
        }
    }

    @Override
    public void invalidateBalance(UUID walletId) {
        String key = BALANCE_PREFIX + walletId;
        try {
            redisTemplate.delete(key);
            log.debug("Invalidated wallet balance cache: walletId={}", walletId);
        } catch (Exception e) {
            log.warn("Redis cache invalidate error for walletId={}: {}", walletId, e.getMessage());
        }
    }
}
