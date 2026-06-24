package com.juanbenevento.ledger.topup.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.topup.application.dto.PseTopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.PseTopUpUseCase;
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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PseTopUpServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TopUpRepository topUpRepository;

    @Mock
    private PaymentPort paymentPort;

    private PseTopUpService pseTopUpService;

    @BeforeEach
    void setUp() {
        pseTopUpService = new PseTopUpService(accountRepository, topUpRepository, paymentPort);
    }

    @Test
    @DisplayName("US-12: Should initiate PSE top-up and return redirect URL")
    void shouldInitiatePseTopUp() {
        UUID walletId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-001", Currency.of("COP"));

        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));
        when(paymentPort.initiatePseRedirect(any(BigDecimal.class), anyString(), anyString(), anyString()))
                .thenReturn("https://mock-pse-gateway.com/pay/abc12345");

        var command = new PseTopUpUseCase.PseTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("100000.00"), "COP",
                "1040", "N", "CC", "1234567890", "CORR-PSE-001");

        PseTopUpResponse response = pseTopUpService.initiate(command);

        assertThat(response).isNotNull();
        assertThat(response.topUpId()).isNotNull();
        assertThat(response.redirectUrl()).startsWith("https://mock-pse-gateway.com/pay/");
        assertThat(response.status()).isEqualTo("PROCESSING");
        assertThat(response.method()).isEqualTo("PSE");
        assertThat(response.expiresAt()).isNotNull();

        verify(topUpRepository).save(any());
    }

    @Test
    @DisplayName("US-12: Should throw when wallet not found for PSE top-up")
    void shouldThrowWhenWalletNotFound() {
        UUID walletId = UUID.randomUUID();
        when(accountRepository.findById(walletId)).thenReturn(Optional.empty());

        var command = new PseTopUpUseCase.PseTopUpCommand(
                walletId, UUID.randomUUID(), new BigDecimal("50000.00"), "COP",
                "1040", "N", "CC", "1234567890", "CORR-PSE-002");

        assertThatThrownBy(() -> pseTopUpService.initiate(command))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    @DisplayName("US-12: Should confirm successful PSE callback and credit wallet")
    void shouldConfirmSuccessfulCallback() {
        UUID walletId = UUID.randomUUID();
        Account account = Account.create(walletId, "WALLET-002", Currency.of("COP"));
        TopUp topUp = TopUp.create(UUID.randomUUID(), walletId, UUID.randomUUID(),
                new BigDecimal("75000.00"), "COP", TopUpMethod.PSE);
        topUp.startProcessing();
        topUp.setExternalReference("EXT-PSE-001");

        when(topUpRepository.findByExternalReference("EXT-PSE-001")).thenReturn(Optional.of(topUp));
        when(accountRepository.findById(walletId)).thenReturn(Optional.of(account));

        pseTopUpService.confirmCallback("EXT-PSE-001", true, null);

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.COMPLETED);
        assertThat(account.getAvailableBalanceSnapshot())
                .isEqualByComparingTo(new BigDecimal("75000.00"));

        verify(topUpRepository).update(any());
        verify(accountRepository).update(any(Account.class), anyString());
    }

    @Test
    @DisplayName("US-12: Should handle failed PSE callback")
    void shouldHandleFailedCallback() {
        UUID walletId = UUID.randomUUID();
        TopUp topUp = TopUp.create(UUID.randomUUID(), walletId, UUID.randomUUID(),
                new BigDecimal("50000.00"), "COP", TopUpMethod.PSE);
        topUp.startProcessing();
        topUp.setExternalReference("EXT-PSE-002");

        when(topUpRepository.findByExternalReference("EXT-PSE-002")).thenReturn(Optional.of(topUp));

        pseTopUpService.confirmCallback("EXT-PSE-002", false, "INSUFFICIENT_FUNDS");

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.FAILED);
        assertThat(topUp.getFailureReason()).isEqualTo("INSUFFICIENT_FUNDS");

        verify(topUpRepository).update(any());
        verify(accountRepository, never()).update(any(), anyString());
    }
}
