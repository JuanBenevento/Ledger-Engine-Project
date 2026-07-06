package com.juanbenevento.ledger.wallet.infrastructure.adapter.output.cache;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletBalanceCacheAdapterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private WalletBalanceCacheAdapter cacheAdapter;

    @BeforeEach
    void setUp() {
        cacheAdapter = new WalletBalanceCacheAdapter(redisTemplate);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("US-16: Should return cached balance on cache hit")
    void shouldReturnCachedBalance() {
        UUID walletId = UUID.randomUUID();
        when(valueOperations.get("wallet:balance:" + walletId)).thenReturn("50000.0000");

        Optional<BigDecimal> result = cacheAdapter.getCachedBalance(walletId);

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualByComparingTo(new BigDecimal("50000.0000"));
    }

    @Test
    @DisplayName("US-16: Should return empty on cache miss")
    void shouldReturnEmptyOnCacheMiss() {
        UUID walletId = UUID.randomUUID();
        when(valueOperations.get("wallet:balance:" + walletId)).thenReturn(null);

        Optional<BigDecimal> result = cacheAdapter.getCachedBalance(walletId);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("US-16: Should cache balance with 10s TTL")
    void shouldCacheBalanceWithTtl() {
        UUID walletId = UUID.randomUUID();
        BigDecimal balance = new BigDecimal("75000.0000");

        cacheAdapter.cacheBalance(walletId, balance);

        verify(valueOperations).set(
                "wallet:balance:" + walletId,
                "75000.0000",
                Duration.ofSeconds(10)
        );
    }

    @Test
    @DisplayName("US-16: Should invalidate cached balance")
    void shouldInvalidateBalance() {
        UUID walletId = UUID.randomUUID();

        cacheAdapter.invalidateBalance(walletId);

        verify(redisTemplate).delete("wallet:balance:" + walletId);
    }

    @Test
    @DisplayName("US-16: Should handle Redis errors gracefully on read")
    void shouldHandleRedisErrorOnRead() {
        UUID walletId = UUID.randomUUID();
        when(valueOperations.get(anyString())).thenThrow(new RuntimeException("Redis connection error"));

        Optional<BigDecimal> result = cacheAdapter.getCachedBalance(walletId);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("US-16: Should handle Redis errors gracefully on write")
    void shouldHandleRedisErrorOnWrite() {
        UUID walletId = UUID.randomUUID();
        doThrow(new RuntimeException("Redis connection error"))
                .when(valueOperations).set(anyString(), anyString(), any(Duration.class));

        // Should not throw
        cacheAdapter.cacheBalance(walletId, new BigDecimal("10000.00"));
    }

    @Test
    @DisplayName("US-16: Should handle Redis errors gracefully on invalidate")
    void shouldHandleRedisErrorOnInvalidate() {
        UUID walletId = UUID.randomUUID();
        doThrow(new RuntimeException("Redis connection error"))
                .when(redisTemplate).delete(anyString());

        // Should not throw
        cacheAdapter.invalidateBalance(walletId);
    }
}
