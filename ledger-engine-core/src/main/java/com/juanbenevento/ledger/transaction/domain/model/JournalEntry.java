package com.juanbenevento.ledger.transaction.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

public class JournalEntry {
    private final UUID id;
    private final UUID accountId;
    private final BigDecimal amount;
    private final JournalEntryType type;

    private JournalEntry(UUID id, UUID accountId, BigDecimal amount, JournalEntryType type) {
        this.id = id;
        this.accountId = accountId;
        this.amount = amount;
        this.type = type;
    }

    public static JournalEntry create(UUID accountId, BigDecimal amount, JournalEntryType type) {
        // Aquí irían validaciones básicas (amount > 0), pero eso es ST-05
        return new JournalEntry(UUID.randomUUID(), accountId, amount, type);
    }

    public static JournalEntry reconstitute(UUID id, UUID accountId, BigDecimal amount, JournalEntryType type) {
        return new JournalEntry(id, accountId, amount, type);
    }

    public UUID getId() { return id; }
    public UUID getAccountId() { return accountId; }
    public BigDecimal getAmount() { return amount; }
    public JournalEntryType getType() { return type; }
}
