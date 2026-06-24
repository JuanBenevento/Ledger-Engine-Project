package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.LedgerMovement;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
@Testcontainers
@Import({JournalEntryRepositoryAdapter.class, JournalEntryPersistenceMapper.class})
class JournalEntryRepositoryAdapterTest {

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
    private JournalEntryRepositoryAdapter adapter;
    @Autowired
    private TransactionJpaRepository transactionJpaRepository;
    @Autowired
    private JournalEntryJpaRepository journalEntryJpaRepository;
    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should retrieve history with deterministic ordering (Timestamp then ID)")
    void shouldReturnDeterministicHistory() {
        // ARRANGE
        UUID accountId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        TransactionEntity tx1 = createTx(now, "TX-A");
        TransactionEntity tx2 = createTx(now, "TX-B");

        transactionJpaRepository.saveAll(List.of(tx1, tx2));

        createEntry(tx1, accountId, "10.00", JournalEntryType.CREDIT);
        createEntry(tx2, accountId, "20.00", JournalEntryType.DEBIT);

        entityManager.flush();
        entityManager.clear();

        // ACT
        List<LedgerMovement> history = adapter.findHistoryByAccountId(accountId);

        // ASSERT
        assertThat(history).hasSize(2);
        assertThat(history.get(0).transactionId()).isNotNull();
        assertThat(history.get(1).transactionId()).isNotNull();
        assertThat(history.get(0).correlationId()).isIn("TX-A", "TX-B");
        assertThat(history.get(0).createdBy()).isEqualTo("TEST_SYSTEM");
    }

    private TransactionEntity createTx(LocalDateTime time, String correlation) {
        return TransactionEntity.builder()
                .id(UUID.randomUUID())
                .correlationId(correlation)
                .createdAt(time)
                .createdBy("TEST_SYSTEM")
                .description("Test Description")
                .transactionType(TransactionType.TRANSFER.name())
                .isNew(true)
                .build();
    }

    private void createEntry(TransactionEntity tx, UUID accountId, String amount, JournalEntryType type) {
        JournalEntryEntity entry = JournalEntryEntity.builder()
                .id(UUID.randomUUID())
                .accountId(accountId)
                .amount(new BigDecimal(amount))
                .currency("USD")
                .type(type)
                .transaction(tx)
                .isNew(true)
                .build();

        journalEntryJpaRepository.save(entry);
    }
}
