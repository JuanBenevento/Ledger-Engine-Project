package com.juanbenevento.ledger.billpay.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.billpay.application.dto.BillPaymentResponse;
import com.juanbenevento.ledger.billpay.application.port.input.PayBillUseCase;
import com.juanbenevento.ledger.billpay.domain.model.Biller;
import com.juanbenevento.ledger.billpay.domain.port.BillPaymentRepository;
import com.juanbenevento.ledger.billpay.domain.port.BillerRepository;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class PayBillServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private BillerRepository billerRepository;

    @Mock
    private BillPaymentRepository billPaymentRepository;

    @Mock
    private TransferUseCase transferUseCase;

    private PayBillService payBillService;

    @BeforeEach
    void setUp() {
        payBillService = new PayBillService(
                accountRepository, billerRepository, billPaymentRepository, transferUseCase);
    }

    @Test
    @DisplayName("US-19: Should process bill payment successfully")
    void shouldProcessBillPayment() {
        UUID walletId = UUID.randomUUID();
        UUID billerId = UUID.randomUUID();

        Account wallet = Account.create(walletId, "WALLET-001", Currency.of("COP"));
        wallet.credit(new BigDecimal("500000.00"));

        Biller biller = Biller.create(billerId, "EPM", "UTILITIES", "1234567890");

        when(billerRepository.findById(billerId)).thenReturn(Optional.of(biller));
        when(accountRepository.findById(walletId)).thenReturn(Optional.of(wallet));
        when(transferUseCase.execute(any(CreateTransferRequest.class)))
                .thenReturn(new TransactionResponse(
                        UUID.randomUUID(), "CORR-001",
                        com.juanbenevento.ledger.transaction.domain.model.TransactionType.TRANSFER,
                        "COMPLETED", java.time.LocalDateTime.now(),
                        new BigDecimal("150000.00"), "COP", "Bill Payment: EPM",
                        new BigDecimal("350000.00"), new BigDecimal("150000.00")));

        var command = new PayBillUseCase.PayBillCommand(
                walletId, UUID.randomUUID(), billerId,
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-001");

        BillPaymentResponse response = payBillService.execute(command);

        assertThat(response).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("150000.00"));
        assertThat(response.status()).isEqualTo("COMPLETED");

        verify(transferUseCase).execute(any(CreateTransferRequest.class));
        verify(billPaymentRepository).save(any());
        verify(billPaymentRepository).update(any());
    }

    @Test
    @DisplayName("US-19: Should reject payment when biller not found")
    void shouldRejectWhenBillerNotFound() {
        when(billerRepository.findById(any())).thenReturn(Optional.empty());

        var command = new PayBillUseCase.PayBillCommand(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-002");

        assertThatThrownBy(() -> payBillService.execute(command))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Biller not found");
    }

    @Test
    @DisplayName("US-19: Should reject payment when biller is inactive")
    void shouldRejectWhenBillerInactive() {
        UUID billerId = UUID.randomUUID();
        Biller inactiveBiller = Biller.reconstitute(billerId, "ETB", "TELECOM", "123", false);

        when(billerRepository.findById(billerId)).thenReturn(Optional.of(inactiveBiller));

        var command = new PayBillUseCase.PayBillCommand(
                UUID.randomUUID(), UUID.randomUUID(), billerId,
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-003");

        assertThatThrownBy(() -> payBillService.execute(command))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Biller is not active");
    }

    @Test
    @DisplayName("US-19: Should reject payment when wallet not found")
    void shouldRejectWhenWalletNotFound() {
        UUID billerId = UUID.randomUUID();
        Biller biller = Biller.create(billerId, "EPM", "UTILITIES", "123");

        when(billerRepository.findById(billerId)).thenReturn(Optional.of(biller));
        when(accountRepository.findById(any())).thenReturn(Optional.empty());

        var command = new PayBillUseCase.PayBillCommand(
                UUID.randomUUID(), UUID.randomUUID(), billerId,
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-004");

        assertThatThrownBy(() -> payBillService.execute(command))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    @DisplayName("US-19: Should reject payment when insufficient funds")
    void shouldRejectWhenInsufficientFunds() {
        UUID walletId = UUID.randomUUID();
        UUID billerId = UUID.randomUUID();

        Account wallet = Account.create(walletId, "WALLET-001", Currency.of("COP"));
        wallet.credit(new BigDecimal("100000.00"));

        Biller biller = Biller.create(billerId, "EPM", "UTILITIES", "123");

        when(billerRepository.findById(billerId)).thenReturn(Optional.of(biller));
        when(accountRepository.findById(walletId)).thenReturn(Optional.of(wallet));

        var command = new PayBillUseCase.PayBillCommand(
                walletId, UUID.randomUUID(), billerId,
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-005");

        assertThatThrownBy(() -> payBillService.execute(command))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient funds");
    }
}
