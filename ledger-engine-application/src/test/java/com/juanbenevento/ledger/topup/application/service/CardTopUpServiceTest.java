package com.juanbenevento.ledger.topup.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CardTopUpUseCase;
import com.juanbenevento.ledger.topup.application.port.output.PaymentPort;
import com.juanbenevento.ledger.topup.domain.model.TopUpStatus;
import com.juanbenevento.ledger.topup.domain.port.TopUpRepository;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardTopUpServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TopUpRepository topUpRepository;

    @Mock
    private PaymentPort paymentPort;

    private CardTopUpService cardTopUpService;

    @BeforeEach
    void setUp() {
        cardTopUpService = new CardTopUpService(accountRepository, topUpRepository, paymentPort);
    }

    @Test
    @DisplayName("US-11: Should process card top-up successfully")
    void shouldProcessCardTopUp() {
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-001", Currency.of("COP"));

        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));
        when(paymentPort.chargeCard(anyString(), any(BigDecimal.class), anyString(), anyString()))
                .thenReturn("CHG-ABC12345");

        var command = new CardTopUpUseCase.CardTopUpCommand(
                walletId, userId, new BigDecimal("50000.00"), "COP", "tok_visa_4242", "CORR-001");

        TopUpResponse response = cardTopUpService.execute(command);

        assertThat(response).isNotNull();
        assertThat(response.topUpId()).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(response.method()).isEqualTo("CARD");

        verify(accountRepository).update(any(Account.class), anyString());
        verify(topUpRepository).save(any());
        verify(topUpRepository).update(any());
    }

    @Test
    @DisplayName("US-11: Should credit wallet balance after card top-up")
    void shouldCreditWalletBalance() {
        UUID walletId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-002", Currency.of("COP"));

        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));
        when(paymentPort.chargeCard(anyString(), any(BigDecimal.class), anyString(), anyString()))
                .thenReturn("CHG-XYZ789");

        var command = new CardTopUpUseCase.CardTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("100000.00"), "COP", "tok_visa_4242", "CORR-002");

        cardTopUpService.execute(command);

        assertThat(account.getAvailableBalanceSnapshot())
                .isEqualByComparingTo(new BigDecimal("100000.00"));
    }

    @Test
    @DisplayName("US-11: Should throw when wallet not found")
    void shouldThrowWhenWalletNotFound() {
        UUID walletId = UUID.randomUUID();
        when(accountRepository.findById(walletId)).thenReturn(Optional.empty());

        var command = new CardTopUpUseCase.CardTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("50000.00"), "COP", "tok_visa_4242", "CORR-003");

        assertThatThrownBy(() -> cardTopUpService.execute(command))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    @DisplayName("US-11: Should mark top-up as FAILED when payment fails")
    void shouldMarkTopUpAsFailed() {
        UUID walletId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-003", Currency.of("COP"));

        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));
        when(paymentPort.chargeCard(anyString(), any(BigDecimal.class), anyString(), anyString()))
                .thenThrow(new RuntimeException("Card declined"));

        var command = new CardTopUpUseCase.CardTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("50000.00"), "COP", "tok_visa_4242", "CORR-004");

        assertThatThrownBy(() -> cardTopUpService.execute(command))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment processing failed");

        // Verify top-up was saved initially and updated with FAILED status
        verify(topUpRepository).save(any());
        verify(topUpRepository).update(argThat(topUp ->
                topUp.getStatus() == TopUpStatus.FAILED
        ));
    }
}
