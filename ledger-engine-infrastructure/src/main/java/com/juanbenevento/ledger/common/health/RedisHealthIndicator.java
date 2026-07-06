package com.juanbenevento.ledger.common.health;

import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator for Redis cache.
 */
@Component
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisConnectionFactory redisConnectionFactory;

    public RedisHealthIndicator(RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @Override
    public Health health() {
        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            String pong = connection.ping();
            if ("PONG".equals(pong)) {
                return Health.up()
                        .withDetail("redis", "connected")
                        .withDetail("ping", pong)
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("redis", "disconnected")
                    .withDetail("error", e.getMessage())
                    .build();
        }
        return Health.down()
                .withDetail("redis", "disconnected")
                .withDetail("error", "PING failed")
                .build();
    }
}