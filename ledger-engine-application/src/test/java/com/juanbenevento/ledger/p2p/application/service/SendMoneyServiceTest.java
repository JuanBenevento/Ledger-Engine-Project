package com.juanbenevento.ledger.p2p.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.p2p.application.dto.P2pTransferResponse;
import com.juanbenevento.ledger.p2p.application.port.input.SendMoneyUseCase;
import com.juanbenevento.ledger.p2p.domain.model.RecipientInfo;
import com.juanbenevento.ledger.p2p.domain.port.P2pTransferRepository;
import com.juanbenevento.ledger.p2p.domain.port.RecipientLookupPort;
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
class SendMoneyServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private P2pTransferRepository p2pTransferRepository;

    @Mock
    private RecipientLookupPort recipientLookupPort;

    @Mock
    private TransferUseCase transferUseCase;

    @Mock
    private DailyLimitService dailyLimitService;

    private SendMoneyService sendMoneyService;

    @BeforeEach
    void setUp() {
        sendMoneyService = new SendMoneyService(
                accountRepository, p2pTransferRepository, recipientLookupPort,
                transferUseCase, dailyLimitService);
    }

    @Test
    @DisplayName("US-15: Should process P2P transfer successfully")
    void shouldProcessP2pTransfer() {
        UUID senderWalletId = UUID.randomUUID();
        UUID senderUserId = UUID.randomUUID();
        UUID recipientWalletId = UUID.randomUUID();
        UUID recipientUserId = UUID.randomUUID();

        Account senderAccount = Account.create(senderWalletId, "WALLET-001", Currency.of("COP"));
        senderAccount.credit(new BigDecimal("500000.00"));

        when(dailyLimitService.getDailyTotal(senderUserId, "COP")).thenReturn(BigDecimal.ZERO);
        when(recipientLookupPort.lookup("recipient@test.com", com.juanbenevento.ledger.p2p.domain.model.LookupType.EMAIL))
                .thenReturn(Optional.of(new RecipientInfo(recipientUserId, recipientWalletId, "John Doe", "COP")));
        when(accountRepository.findById(senderWalletId)).thenReturn(Optional.of(senderAccount));
        when(transferUseCase.execute(any(CreateTransferRequest.class)))
                .thenReturn(new TransactionResponse(
                        UUID.randomUUID(), "CORR-001",
                        com.juanbenevento.ledger.transaction.domain.model.TransactionType.TRANSFER,
                        "COMPLETED", java.time.LocalDateTime.now(),
                        new BigDecimal("50000.00"), "COP", "P2P Transfer",
                        new BigDecimal("450000.00"), new BigDecimal("50000.00")));

        var command = new SendMoneyUseCase.SendMoneyCommand(
                senderWalletId, senderUserId, "recipient@test.com", "EMAIL",
                new BigDecimal("50000.00"), "COP", "Lunch money", "CORR-P2P-001");

        P2pTransferResponse response = sendMoneyService.execute(command);

        assertThat(response).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(response.status()).isEqualTo("COMPLETED");

        verify(transferUseCase).execute(any(CreateTransferRequest.class));
        verify(p2pTransferRepository).save(any());
        verify(p2pTransferRepository).update(any());
    }

    @Test
    @DisplayName("US-15: Should reject transfer when daily limit exceeded")
    void shouldRejectWhenDailyLimitExceeded() {
        UUID senderUserId = UUID.randomUUID();

        when(dailyLimitService.getDailyTotal(senderUserId, "COP"))
                .thenReturn(new BigDecimal("1900000.00"));

        var command = new SendMoneyUseCase.SendMoneyCommand(
                UUID.randomUUID(), senderUserId, "recipient@test.com", "EMAIL",
                new BigDecimal("200000.00"), "COP", null, "CORR-P2P-002");

        assertThatThrownBy(() -> sendMoneyService.execute(command))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Daily transfer limit exceeded");
    }

    @Test
    @DisplayName("US-15: Should reject transfer when recipient not found")
    void shouldRejectWhenRecipientNotFound() {
        when(dailyLimitService.getDailyTotal(any(), anyString())).thenReturn(BigDecimal.ZERO);
        when(recipientLookupPort.lookup("unknown@test.com", com.juanbenevento.ledger.p2p.domain.model.LookupType.EMAIL))
                .thenReturn(Optional.empty());

        var command = new SendMoneyUseCase.SendMoneyCommand(
                UUID.randomUUID(), UUID.randomUUID(), "unknown@test.com", "EMAIL",
                new BigDecimal("50000.00"), "COP", null, "CORR-P2P-003");

        assertThatThrownBy(() -> sendMoneyService.execute(command))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Recipient not found");
    }

    @Test
    @DisplayName("US-15: Should reject transfer when sender wallet not found")
    void shouldRejectWhenSenderWalletNotFound() {
        UUID senderWalletId = UUID.randomUUID();
        UUID recipientWalletId = UUID.randomUUID();

        when(dailyLimitService.getDailyTotal(any(), anyString())).thenReturn(BigDecimal.ZERO);
        when(recipientLookupPort.lookup(anyString(), any()))
                .thenReturn(Optional.of(new RecipientInfo(UUID.randomUUID(), recipientWalletId, "John", "COP")));
        when(accountRepository.findById(senderWalletId)).thenReturn(Optional.empty());

        var command = new SendMoneyUseCase.SendMoneyCommand(
                senderWalletId, UUID.randomUUID(), "recipient@test.com", "EMAIL",
                new BigDecimal("50000.00"), "COP", null, "CORR-P2P-004");

        assertThatThrownBy(() -> sendMoneyService.execute(command))
                .isInstanceOf(AccountNotFoundException.class);
    }
}
