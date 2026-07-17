package com.juanbenevento.ledger.account.appliation.service;

import com.juanbenevento.ledger.account.application.dto.AccountStatementResponse;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.application.service.GetAccountHistoryService;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.account.domain.model.AccountStatus;
import com.juanbenevento.ledger.common.domain.exception.LedgerIntegrityException;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.application.port.output.JournalEntryRepository;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.LedgerMovement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetAccountHistoryServiceTest {

    @Mock
    private JournalEntryRepository journalEntryRepository;
    @Mock
    private AccountRepository accountRepository;
    @InjectMocks
    private GetAccountHistoryService service;

    private static final UUID ACCOUNT_ID = UUID.randomUUID();
    private Account accountMock;

    @BeforeEach
    void setUp() {
        accountMock = Account.reconstitute(
                ACCOUNT_ID, "ACC-001", Currency.of("USD"),
                new BigDecimal("100.0000"),
                new BigDecimal("100.0000"),
                AccountStatus.ACTIVE, 1L
        );
    }

    @Test
    @DisplayName("Should reconstruct history and match snapshot balance (Happy Path)")
    void shouldReconstructHistoryCorrectly() {
        // ARRANGE
        List<LedgerMovement> movements = List.of(
                createMovement(JournalEntryType.CREDIT, "50.0000"),
                createMovement(JournalEntryType.CREDIT, "80.0000"),
                createMovement(JournalEntryType.DEBIT,  "30.0000")
        );

        when(accountRepository.findById(ACCOUNT_ID)).thenReturn(Optional.of(accountMock));
        when(journalEntryRepository.findHistoryByAccountId(ACCOUNT_ID)).thenReturn(movements);

        // ACT
        List<AccountStatementResponse> result = service.execute(ACCOUNT_ID);

        // ASSERT
        assertThat(result).hasSize(3);
        assertThat(result.get(0).runningBalance()).isEqualByComparingTo("50.00");
        assertThat(result.get(1).runningBalance()).isEqualByComparingTo("130.00");
        assertThat(result.get(2).runningBalance()).isEqualByComparingTo("100.00");
    }

    @Test
    @DisplayName("CRITICAL: Should throw LedgerIntegrityException if reconstruction mismatches snapshot")
    void shouldDetectDataCorruption() {
        // ARRANGE:
        List<LedgerMovement> movements = List.of(
                createMovement(JournalEntryType.CREDIT, "50.0000")
        );

        when(accountRepository.findById(ACCOUNT_ID)).thenReturn(Optional.of(accountMock));
        when(journalEntryRepository.findHistoryByAccountId(ACCOUNT_ID)).thenReturn(movements);

        // ACT & ASSERT
        assertThatThrownBy(() -> service.execute(ACCOUNT_ID))
                .isInstanceOf(LedgerIntegrityException.class)
                .hasMessageContaining("Ledger mismatch");
    }

    private LedgerMovement createMovement(JournalEntryType type, String amount) {
        return new LedgerMovement(
                UUID.randomUUID(), "corr-1", LocalDateTime.now(), "user",
                type, new BigDecimal(amount), Currency.of("USD")
        );
    }
}
