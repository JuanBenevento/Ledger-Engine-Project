package com.juanbenevento.ledger.p2p.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory daily limit tracking service.
 * In production, this would use Redis for distributed tracking.
 * Tracks total transfers per user per day per currency.
 */
@Slf4j
@Service
public class DailyLimitService {

    // In-memory store: "userId:currency:date" → total amount
    private final Map<String, BigDecimal> dailyTotals = new ConcurrentHashMap<>();

    public BigDecimal getDailyTotal(UUID userId, String currency) {
        String key = buildKey(userId, currency);
        return dailyTotals.getOrDefault(key, BigDecimal.ZERO);
    }

    public void recordTransfer(UUID userId, BigDecimal amount, String currency) {
        String key = buildKey(userId, currency);
        dailyTotals.merge(key, amount, BigDecimal::add);
        log.debug("Recorded transfer for daily limit: key={}, amount={}", key, amount);
    }

    public void resetDaily(UUID userId, String currency) {
        String key = buildKey(userId, currency);
        dailyTotals.remove(key);
    }

    private String buildKey(UUID userId, String currency) {
        String date = java.time.LocalDate.now().toString();
        return userId.toString() + ":" + currency + ":" + date;
    }
}
