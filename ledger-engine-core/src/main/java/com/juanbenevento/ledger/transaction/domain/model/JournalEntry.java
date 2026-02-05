package com.juanbenevento.ledger.transaction.domain.model;

import com.juanbenevento.ledger.common.domain.model.Currency;

import java.math.BigDecimal;
import java.util.UUID;

public class JournalEntry {
    private final UUID id;
    private final UUID accountId;
    private final BigDecimal amount;
    private final Currency currency;
    private final JournalEntryType type;

    private JournalEntry(UUID id, UUID accountId, BigDecimal amount, Currency currency, JournalEntryType type) {
        this.id = id;
        this.accountId = accountId;
        this.amount = amount;
        this.currency = currency;
        this.type = type;
    }

    public static JournalEntry create(UUID accountId, BigDecimal amount, Currency currency, JournalEntryType type) {
        return new JournalEntry(UUID.randomUUID(), accountId, amount, currency, type);
    }

    public static JournalEntry reconstitute(UUID id, UUID accountId, BigDecimal amount, Currency currency, JournalEntryType type) {
        return new JournalEntry(id, accountId, amount, currency, type);
    }

    public UUID getId() { return id; }
    public UUID getAccountId() { return accountId; }
    public BigDecimal getAmount() { return amount; }
    public Currency getCurrency() { return currency; }
    public JournalEntryType getType() { return type; }
}
