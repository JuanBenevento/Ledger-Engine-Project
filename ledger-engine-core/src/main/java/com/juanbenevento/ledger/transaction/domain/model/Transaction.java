package com.juanbenevento.ledger.transaction.domain.model;

import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.domain.exception.InvalidTransactionException;

import java.math.BigDecimal;
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

        validate();
    }

    public static Transaction create(String correlationId, String description, TransactionType type, List<JournalEntry> entries) {
        return new Transaction(UUID.randomUUID(), correlationId, description, type, LocalDateTime.now(), entries);
    }

    public static Transaction reconstitute(UUID id, String correlationId, String description, TransactionType type, LocalDateTime createdAt, List<JournalEntry> entries) {
        return new Transaction(id, correlationId, description, type, createdAt, entries);
    }

    public BigDecimal getTotalAmount() {
        return entries.stream()
                .filter(e -> e.getType() == JournalEntryType.DEBIT)
                .map(JournalEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validate() {
        if (entries == null || entries.isEmpty()) {
            throw new InvalidTransactionException("Transaction must have at least one entry");
        }

        Currency firstCurrency = entries.get(0).getCurrency();
        boolean allSameCurrency = entries.stream()
                .allMatch(e -> e.getCurrency().equals(firstCurrency));

        if (!allSameCurrency) {
            throw new InvalidTransactionException("Transaction entries contains mixed currencies");
        }

        BigDecimal totalDebits = entries.stream()
                .filter(e -> e.getType() == JournalEntryType.DEBIT)
                .map(JournalEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredits = entries.stream()
                .filter(e -> e.getType() == JournalEntryType.CREDIT)
                .map(JournalEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new InvalidTransactionException(
                    String.format("Transaction unbalanced: Debits=%s, Credits=%s", totalDebits, totalCredits)
            );
        }
    }

    public UUID getId() { return id; }
    public String getCorrelationId() { return correlationId; }
    public String getDescription() { return description; }
    public TransactionType getType() { return type; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<JournalEntry> getEntries() { return Collections.unmodifiableList(entries); }
}
