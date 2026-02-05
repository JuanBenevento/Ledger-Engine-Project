package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.domain.Persistable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
class TransactionEntity implements Persistable<UUID> {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, updatable = false)
    private String correlationId; // RNF-01

    @Column(nullable = false, updatable = false)
    private String description;

    @Column(nullable = false, updatable = false)
    private String transactionType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    @Builder.Default
    private List<JournalEntryEntity> entries = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private String createdBy;

    @Transient
    @Builder.Default
    @Setter(AccessLevel.NONE)
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    public void addEntry(JournalEntryEntity entry) {
        if (entries == null) entries = new ArrayList<>();
        entries.add(entry);
        entry.setTransaction(this);
    }


}
