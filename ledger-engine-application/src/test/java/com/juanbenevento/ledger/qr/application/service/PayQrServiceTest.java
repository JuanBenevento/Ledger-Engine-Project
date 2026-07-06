package com.juanbenevento.ledger.qr.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.qr.application.dto.PayQrRequest;
import com.juanbenevento.ledger.qr.application.dto.PayQrResponse;
import com.juanbenevento.ledger.qr.domain.model.QrCode;
import com.juanbenevento.ledger.qr.domain.model.QrType;
import com.juanbenevento.ledger.qr.domain.port.QrCodeRepository;
import com.juanbenevento.ledger.qr.domain.port.QrPayloadSigner;
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
class PayQrServiceTest {

    @Mock
    private QrCodeRepository qrCodeRepository;
    @Mock
    private QrPayloadSigner qrPayloadSigner;
    @Mock
    private AccountRepository accountRepository;

    private PayQrService payQrService;

    private UUID payerWalletId;
    private UUID recipientWalletId;
    private UUID qrCodeId;

    @BeforeEach
    void setUp() {
        payQrService = new PayQrService(qrCodeRepository, qrPayloadSigner, accountRepository);
        payerWalletId = UUID.randomUUID();
        recipientWalletId = UUID.randomUUID();
        qrCodeId = UUID.randomUUID();
    }

    @Test
    @DisplayName("US-18: Should pay a FIXED QR code successfully")
    void shouldPayFixedQrCode() {
        QrCode qrCode = QrCode.create(qrCodeId, recipientWalletId, UUID.randomUUID(),
                QrType.FIXED, null, "COP", "Test", "hmac-sig", 3600);

        Account senderAccount = Account.create(payerWalletId, "SENDER-001", Currency.of("COP"));
        senderAccount.credit(new BigDecimal("100000.00"));

        Account recipientAccount = Account.create(recipientWalletId, "RECIPIENT-001", Currency.of("COP"));

        when(qrCodeRepository.findById(qrCodeId)).thenReturn(Optional.of(qrCode));
        when(qrPayloadSigner.verify(anyString(), anyString())).thenReturn(true);
        when(accountRepository.findById(payerWalletId)).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findById(recipientWalletId)).thenReturn(Optional.of(recipientAccount));

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                new BigDecimal("25000.00"), "hmac-sig");

        PayQrResponse response = payQrService.execute(request);

        assertThat(response).isNotNull();
        assertThat(response.transactionId()).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(response.currency()).isEqualTo("COP");
        assertThat(response.senderWalletId()).isEqualTo(payerWalletId);
        assertThat(response.recipientWalletId()).isEqualTo(recipientWalletId);

        verify(qrCodeRepository).update(qrCode);
        verify(accountRepository, times(2)).save(any(Account.class), anyString(), anyString());
    }

    @Test
    @DisplayName("US-18: Should pay a DYNAMIC QR code using embedded amount")
    void shouldPayDynamicQrCode() {
        QrCode qrCode = QrCode.create(qrCodeId, recipientWalletId, UUID.randomUUID(),
                QrType.DYNAMIC, new BigDecimal("50000.00"), "COP", "Test", "hmac-sig", 3600);

        Account senderAccount = Account.create(payerWalletId, "SENDER-002", Currency.of("COP"));
        senderAccount.credit(new BigDecimal("100000.00"));

        Account recipientAccount = Account.create(recipientWalletId, "RECIPIENT-002", Currency.of("COP"));

        when(qrCodeRepository.findById(qrCodeId)).thenReturn(Optional.of(qrCode));
        when(qrPayloadSigner.verify(anyString(), anyString())).thenReturn(true);
        when(accountRepository.findById(payerWalletId)).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findById(recipientWalletId)).thenReturn(Optional.of(recipientAccount));

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                new BigDecimal("50000.00"), "hmac-sig");

        PayQrResponse response = payQrService.execute(request);

        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("US-18: Should reject payment for non-existent QR code")
    void shouldRejectPaymentForNonExistentQrCode() {
        when(qrCodeRepository.findById(any())).thenReturn(Optional.empty());

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                new BigDecimal("10000"), "hmac");

        assertThatThrownBy(() -> payQrService.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("QR Code not found");
    }

    @Test
    @DisplayName("US-18: Should reject payment with invalid HMAC signature")
    void shouldRejectPaymentWithInvalidSignature() {
        QrCode qrCode = QrCode.create(qrCodeId, recipientWalletId, UUID.randomUUID(),
                QrType.FIXED, null, "COP", "Test", "hmac-sig", 3600);

        when(qrCodeRepository.findById(qrCodeId)).thenReturn(Optional.of(qrCode));
        when(qrPayloadSigner.verify(anyString(), anyString())).thenReturn(false);

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                new BigDecimal("10000"), "wrong-hmac");

        assertThatThrownBy(() -> payQrService.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("tampering");
    }

    @Test
    @DisplayName("US-18: Should reject payment for already-used QR code")
    void shouldRejectPaymentForUsedQrCode() {
        QrCode qrCode = QrCode.create(qrCodeId, recipientWalletId, UUID.randomUUID(),
                QrType.FIXED, null, "COP", "Test", "hmac-sig", 3600);
        qrCode.markAsPaid(UUID.randomUUID()); // Mark as used

        when(qrCodeRepository.findById(qrCodeId)).thenReturn(Optional.of(qrCode));
        when(qrPayloadSigner.verify(anyString(), anyString())).thenReturn(true);

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                new BigDecimal("10000"), "hmac-sig");

        assertThatThrownBy(() -> payQrService.execute(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already been used");
    }

    @Test
    @DisplayName("US-18: Should reject payment with insufficient funds")
    void shouldRejectPaymentWithInsufficientFunds() {
        QrCode qrCode = QrCode.create(qrCodeId, recipientWalletId, UUID.randomUUID(),
                QrType.FIXED, null, "COP", "Test", "hmac-sig", 3600);

        Account senderAccount = Account.create(payerWalletId, "SENDER-POOR", Currency.of("COP"));
        senderAccount.credit(new BigDecimal("100.00")); // Very low balance

        Account recipientAccount = Account.create(recipientWalletId, "RECIPIENT-OK", Currency.of("COP"));

        when(qrCodeRepository.findById(qrCodeId)).thenReturn(Optional.of(qrCode));
        when(qrPayloadSigner.verify(anyString(), anyString())).thenReturn(true);
        when(accountRepository.findById(payerWalletId)).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findById(recipientWalletId)).thenReturn(Optional.of(recipientAccount));

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                new BigDecimal("50000.00"), "hmac-sig");

        assertThatThrownBy(() -> payQrService.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient funds");
    }

    @Test
    @DisplayName("US-18: Should reject FIXED QR payment without amount")
    void shouldRejectFixedQrPaymentWithoutAmount() {
        QrCode qrCode = QrCode.create(qrCodeId, recipientWalletId, UUID.randomUUID(),
                QrType.FIXED, null, "COP", "Test", "hmac-sig", 3600);

        when(qrCodeRepository.findById(qrCodeId)).thenReturn(Optional.of(qrCode));
        when(qrPayloadSigner.verify(anyString(), anyString())).thenReturn(true);

        PayQrRequest request = new PayQrRequest(qrCodeId, payerWalletId, UUID.randomUUID(),
                null, "hmac-sig");

        assertThatThrownBy(() -> payQrService.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount is required");
    }
}
