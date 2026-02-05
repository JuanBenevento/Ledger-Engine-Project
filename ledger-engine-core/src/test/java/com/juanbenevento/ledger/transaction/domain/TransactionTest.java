package com.juanbenevento.ledger.transaction.domain;

import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.domain.exception.InvalidTransactionException;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntry;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TransactionTest {

    @Test
    @DisplayName("Should create a valid transaction when debits and credits are balanced (Double Entry Principle)")
    void shouldCreateBalancedTransaction() {
        UUID account1 = UUID.randomUUID();
        UUID account2 = UUID.randomUUID();
        Currency usd = Currency.of("USD");

        JournalEntry debit = JournalEntry.create(account1, new BigDecimal("100.00"), usd, JournalEntryType.DEBIT);
        JournalEntry credit = JournalEntry.create(account2, new BigDecimal("100.00"), usd, JournalEntryType.CREDIT);

        Transaction transaction = Transaction.create(
                "corr-123",
                "Valid transfer",
                TransactionType.TRANSFER,
                List.of(debit, credit)
        );

        assertThat(transaction).isNotNull();
        assertThat(transaction.getEntries()).hasSize(2);
    }

    @Test
    @DisplayName("Should throw InvalidTransactionException when transaction is unbalanced (Golden Rule Violation)")
    void shouldThrowExceptionWhenTransactionIsUnbalanced() {
        UUID account1 = UUID.randomUUID();
        Currency usd = Currency.of("USD");

        JournalEntry debit = JournalEntry.create(account1, new BigDecimal("100.00"), usd, JournalEntryType.DEBIT);
        JournalEntry credit = JournalEntry.create(account1, new BigDecimal("99.00"), usd, JournalEntryType.CREDIT);

        assertThatThrownBy(() -> Transaction.create(
                "corr-fail", "Fraud attempt", TransactionType.TRANSFER, List.of(debit, credit)
        ))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("unbalanced");
    }

    @Test
    @DisplayName("Should throw InvalidTransactionException when entries have mixed currencies")
    void shouldThrowExceptionWhenCurrenciesAreMixed() {
        JournalEntry usdEntry = JournalEntry.create(UUID.randomUUID(), BigDecimal.TEN, Currency.of("USD"), JournalEntryType.DEBIT);
        JournalEntry eurEntry = JournalEntry.create(UUID.randomUUID(), BigDecimal.TEN, Currency.of("EUR"), JournalEntryType.CREDIT);

        assertThatThrownBy(() -> Transaction.create(
                "corr-mix", "Mixed Currency Error", TransactionType.TRANSFER, List.of(usdEntry, eurEntry)
        ))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("mixed currencies");
    }
}
