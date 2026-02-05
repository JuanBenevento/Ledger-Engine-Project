package com.juanbenevento.ledger.transaction.application;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.exception.InsufficientFundsException;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.output.TransactionRepository;
import com.juanbenevento.ledger.transaction.application.service.TransferService;
import com.juanbenevento.ledger.transaction.domain.exception.InvalidTransactionException;
import com.juanbenevento.ledger.transaction.domain.exception.TransactionAlreadyProcessedException;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;

    @InjectMocks private TransferService transferService;

    private final Currency USD = Currency.of("USD");
    private final UUID sourceId = UUID.randomUUID();
    private final UUID targetId = UUID.randomUUID();
    private final String CORRELATION_ID = "corr-transfer-001";

    @Test
    @DisplayName("Should execute transfer successfully when request is valid")
    void shouldExecuteTransferSuccessfully() {
        // 1. ARRANGE
        String auditUser = "TEST_AUDITOR";

        CreateTransferRequest request = new CreateTransferRequest(
                sourceId, targetId, new BigDecimal("100.0000"), "USD", "Payment", CORRELATION_ID,
                auditUser // CORRECCIÓN 2: Pasamos el campo 'createdBy' que faltaba
        );

        Account source = Account.reconstitute(
                sourceId, "SRC-001", USD,
                new BigDecimal("1000.0000"),
                new BigDecimal("1000.0000"),
                com.juanbenevento.ledger.account.domain.model.AccountStatus.ACTIVE,
                0L
        );

        Account target = Account.create(targetId, "TGT-001", USD);

        when(transactionRepository.existsByCorrelationId(CORRELATION_ID)).thenReturn(false);
        when(accountRepository.findById(sourceId)).thenReturn(Optional.of(source));
        when(accountRepository.findById(targetId)).thenReturn(Optional.of(target));

        // 2. ACT
        TransactionResponse response = transferService.execute(request);

        // 3. ASSERT
        assertThat(response).isNotNull();
        assertThat(response.correlationId()).isEqualTo(CORRELATION_ID);
        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(response.sourceNewBalance()).isEqualByComparingTo("900.0000");
        assertThat(response.targetNewBalance()).isEqualByComparingTo("100.0000");

        ArgumentCaptor<Transaction> txCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(txCaptor.capture(), eq(auditUser));

        Transaction savedTx = txCaptor.getValue();
        assertThat(savedTx.getTotalAmount()).isEqualByComparingTo("100.0000");
        assertThat(savedTx.getDescription()).isEqualTo("Payment");
        assertThat(savedTx.getEntries()).hasSize(2);

        verify(accountRepository).update(eq(source), eq(auditUser));
        verify(accountRepository).update(eq(target), eq(auditUser));

        assertThat(source.getAvailableBalanceSnapshot()).isEqualByComparingTo("900.0000");
        assertThat(target.getAvailableBalanceSnapshot()).isEqualByComparingTo("100.0000");
    }

    @Test
    @DisplayName("Should throw TransactionAlreadyProcessedException when correlation ID already exists")
    void shouldFailWhenDuplicateCorrelationId() {
        CreateTransferRequest request = new CreateTransferRequest(
                sourceId, targetId, BigDecimal.TEN, "USD", "Desc", CORRELATION_ID, "TEST_USER"
        );

        when(transactionRepository.existsByCorrelationId(CORRELATION_ID)).thenReturn(true);

        assertThatThrownBy(() -> transferService.execute(request))
                .isInstanceOf(TransactionAlreadyProcessedException.class);

        verify(accountRepository, never()).findById(any());
        verify(transactionRepository, never()).save(any(), anyString());
    }


    @Test
    @DisplayName("Should throw InvalidTransactionException when source account currency mismatches")
    void shouldFailWhenSourceCurrencyMismatch() {
        Account eurAccount = Account.create(sourceId, "EUR-ACC", Currency.of("EUR"));
        Account usdAccount = Account.create(targetId, "USD-ACC", USD);

        CreateTransferRequest request = new CreateTransferRequest(
                sourceId, targetId, BigDecimal.TEN, "USD", "Desc", CORRELATION_ID, "TEST_USER"
        );

        when(transactionRepository.existsByCorrelationId(any())).thenReturn(false);
        when(accountRepository.findById(sourceId)).thenReturn(Optional.of(eurAccount));
        when(accountRepository.findById(targetId)).thenReturn(Optional.of(usdAccount));

        assertThatThrownBy(() -> transferService.execute(request))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("Source account currency");

        verify(accountRepository, never()).update(any(), anyString());
    }

    @Test
    @DisplayName("Should throw InsufficientFundsException when source account balance is too low")
    void shouldFailWhenInsufficientFunds() {
        Account poorSource = Account.create(sourceId, "SRC-POOR", USD);
        Account target = Account.create(targetId, "TGT", USD);

        CreateTransferRequest request = new CreateTransferRequest(
                sourceId, targetId, new BigDecimal("100.0000"), "USD", "Desc", CORRELATION_ID, "TEST_USER"
        );

        when(transactionRepository.existsByCorrelationId(any())).thenReturn(false);
        when(accountRepository.findById(sourceId)).thenReturn(Optional.of(poorSource));
        when(accountRepository.findById(targetId)).thenReturn(Optional.of(target));

        assertThatThrownBy(() -> transferService.execute(request))
                .isInstanceOf(InsufficientFundsException.class);

        verify(transactionRepository, never()).save(any(), anyString());
        verify(accountRepository, never()).update(eq(target), anyString());
    }
}
