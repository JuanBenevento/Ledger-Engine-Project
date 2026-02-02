package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "journal_entries", indexes = {
        @Index(name = "idx_journal_entry_account", columnList = "account_id"),
        @Index(name = "idx_journal_entry_tx", columnList = "transaction_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
class JournalEntryEntity {
    @Id
    private UUID id;

    @Column(nullable = false, precision = 19, scale = 4, updatable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 10)
    private JournalEntryType type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false, updatable = false)
    private TransactionEntity transaction;

    @Column(name = "account_id", nullable = false, updatable = false)
    private UUID accountId;

    void setTransaction(TransactionEntity transaction) {
        this.transaction = transaction;
    }
}
