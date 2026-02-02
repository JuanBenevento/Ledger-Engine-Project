package com.juanbenevento.ledger.transaction.domain.model;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Transaction {
    private final UUID id;
    private final String correlationId;
    private final String description;
    private final TransactionType type;
    private final LocalDateTime createdAt;
    private final List<JournalEntry> entries;

    private Transaction(UUID id, String correlationId, String description, TransactionType type, LocalDateTime createdAt, List<JournalEntry> entries) {
        this.id = id;
        this.correlationId = correlationId;
        this.description = description;
        this.type = type;
        this.createdAt = createdAt;
        this.entries = entries;
    }

    public static Transaction create(String correlationId, String description, TransactionType type, List<JournalEntry> entries) {
        // En ST-05 añadiremos aquí la validación: isBalanced()
        return new Transaction(UUID.randomUUID(), correlationId, description, type, LocalDateTime.now(), entries);
    }

    public static Transaction reconstitute(UUID id, String correlationId, String description, TransactionType type, LocalDateTime createdAt, List<JournalEntry> entries) {
        return new Transaction(id, correlationId, description, type, createdAt, entries);
    }

    public UUID getId() { return id; }
    public String getCorrelationId() { return correlationId; }
    public String getDescription() { return description; }
    public TransactionType getType() { return type; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<JournalEntry> getEntries() { return Collections.unmodifiableList(entries); }
}
