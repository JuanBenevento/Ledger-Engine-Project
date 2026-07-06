package com.juanbenevento.ledger.topup.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CashTopUpUseCase;
import com.juanbenevento.ledger.topup.application.port.output.PaymentPort;
import com.juanbenevento.ledger.topup.domain.model.TopUp;
import com.juanbenevento.ledger.topup.domain.model.TopUpMethod;
import com.juanbenevento.ledger.topup.domain.model.TopUpStatus;
import com.juanbenevento.ledger.topup.domain.port.TopUpRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CashTopUpServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TopUpRepository topUpRepository;

    @Mock
    private PaymentPort paymentPort;

    private CashTopUpService cashTopUpService;

    @BeforeEach
    void setUp() {
        cashTopUpService = new CashTopUpService(accountRepository, topUpRepository, paymentPort);
    }

    @Test
    @DisplayName("US-13: Should initiate cash top-up with reference code")
    void shouldInitiateCashTopUp() {
        UUID walletId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-001", Currency.of("COP"));

        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));
        when(paymentPort.generateCashReference(any(BigDecimal.class), anyString()))
                .thenReturn("ABCD1234");

        var command = new CashTopUpUseCase.CashTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("50000.00"), "COP", "CORR-CASH-001");

        TopUpResponse response = cashTopUpService.initiate(command);

        assertThat(response).isNotNull();
        assertThat(response.topUpId()).isNotNull();
        assertThat(response.referenceCode()).isEqualTo("ABCD1234");
        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(response.method()).isEqualTo("CASH");

        verify(topUpRepository).save(any());
    }

    @Test
    @DisplayName("US-13: Should throw when wallet not found for cash top-up")
    void shouldThrowWhenWalletNotFound() {
        UUID walletId = UUID.randomUUID();
        when(accountRepository.findById(walletId)).thenReturn(Optional.empty());

        var command = new CashTopUpUseCase.CashTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("50000.00"), "COP", "CORR-CASH-002");

        assertThatThrownBy(() -> cashTopUpService.initiate(command))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    @DisplayName("US-13: Should confirm cash top-up and credit wallet")
    void shouldConfirmCashTopUp() {
        UUID walletId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-002", Currency.of("COP"));
        TopUp topUp = TopUp.create(UUID.randomUUID(), walletId, UUID.randomUUID(),
                new BigDecimal("75000.00"), "COP", TopUpMethod.CASH);
        topUp.setReferenceCode("XYZT5678");
        topUp.setExpiresAt(LocalDateTime.now().plusHours(24));

        when(topUpRepository.findById(topUp.getId())).thenReturn(Optional.of(topUp));
        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));

        TopUpResponse response = cashTopUpService.confirm(topUp.getId());

        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(account.getAvailableBalanceSnapshot())
                .isEqualByComparingTo(new BigDecimal("75000.00"));

        verify(topUpRepository).update(any());
        verify(accountRepository).update(any(Account.class), anyString());
    }

    @Test
    @DisplayName("US-13: Should reject confirmation of expired cash top-up")
    void shouldRejectExpiredTopUp() {
        UUID walletId = UUID.randomUUID();
        TopUp topUp = TopUp.create(UUID.randomUUID(), walletId, UUID.randomUUID(),
                new BigDecimal("30000.00"), "COP", TopUpMethod.CASH);
        topUp.setReferenceCode("EXPIRED1");
        topUp.setExpiresAt(LocalDateTime.now().minusHours(1)); // Already expired

        when(topUpRepository.findById(topUp.getId())).thenReturn(Optional.of(topUp));

        assertThatThrownBy(() -> cashTopUpService.confirm(topUp.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired");

        verify(topUpRepository).update(argThat(t -> t.getStatus() == TopUpStatus.EXPIRED));
    }

    @Test
    @DisplayName("US-13: Should reject confirmation of already completed top-up")
    void shouldRejectAlreadyCompletedTopUp() {
        UUID walletId = UUID.randomUUID();
        TopUp topUp = TopUp.create(UUID.randomUUID(), walletId, UUID.randomUUID(),
                new BigDecimal("20000.00"), "COP", TopUpMethod.CASH);
        topUp.startProcessing();
        topUp.complete("CASH-CONFIRMED");

        when(topUpRepository.findById(topUp.getId())).thenReturn(Optional.of(topUp));

        assertThatThrownBy(() -> cashTopUpService.confirm(topUp.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot confirm");
    }
}
