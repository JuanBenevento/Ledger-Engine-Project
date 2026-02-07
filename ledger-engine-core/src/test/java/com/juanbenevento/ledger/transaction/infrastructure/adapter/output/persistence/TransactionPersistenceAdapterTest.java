package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntry;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
@Testcontainers
@Import({TransactionPersistenceAdapter.class, TransactionPersistenceMapper.class})
class TransactionPersistenceAdapterTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private TransactionPersistenceAdapter adapter;

    @Autowired
    private TransactionJpaRepository jpaRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should map Domain Transaction to Entity and persist it correctly with Audit Data")
    void shouldSaveTransaction() {
        // 1. ARRANGE
        String auditUser = "ADAPTER_TEST_USER";

        Transaction domainTransaction = Transaction.create(
                "corr-adapter-001",
                "Adapter Integration Test",
                TransactionType.TRANSFER,
                List.of(
                        JournalEntry.create(UUID.randomUUID(), new BigDecimal("50.0000"), Currency.of(Currency.Code.USD), JournalEntryType.DEBIT),
                        JournalEntry.create(UUID.randomUUID(), new BigDecimal("50.0000"), Currency.of(Currency.Code.USD), JournalEntryType.CREDIT)
                )
        );

        adapter.save(domainTransaction, auditUser);

        entityManager.flush();
        entityManager.clear();

        // 3. ASSERT
        TransactionEntity savedEntity = jpaRepository.findById(domainTransaction.getId()).orElseThrow();

        assertThat(savedEntity.getCorrelationId()).isEqualTo("corr-adapter-001");
        assertThat(savedEntity.getEntries()).hasSize(2);
        assertThat(savedEntity.getEntries().get(0).getAmount()).isEqualByComparingTo("50.0000");
        assertThat(savedEntity.getCreatedBy()).isEqualTo(auditUser);
    }

    @Test
    @DisplayName("Should return true when correlation ID exists")
    void shouldCheckExistenceCorrectly() {
        TransactionEntity entity = TransactionEntity.builder()
                .id(UUID.randomUUID())
                .correlationId("corr-existing")
                .description("Pre-existing")
                .transactionType("TRANSFER")
                .createdAt(java.time.LocalDateTime.now())
                .createdBy("SYSTEM_SEED")
                .isNew(true)
                .build();

        jpaRepository.save(entity);

        entityManager.flush();

        // 2. ACT
        boolean exists = adapter.existsByCorrelationId("corr-existing");
        boolean notExists = adapter.existsByCorrelationId("corr-fake");

        // 3. ASSERT
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }
}
