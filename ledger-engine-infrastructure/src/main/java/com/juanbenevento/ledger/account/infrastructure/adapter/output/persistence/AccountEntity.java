package com.juanbenevento.ledger.account.infrastructure.adapter.output.persistence;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AccountEntity implements Persistable<UUID> {
    @Id
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String accountNumber;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal accountingBalance;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal availableBalance;

    @Column(nullable = false)
    private String status;

    @Version
    private Long version;

    @Column(nullable = false, unique = true)
    private String correlationId;

    @Column(nullable = false)
    private String createdBySystem;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

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
}