package com.juanbenevento.ledger.qr.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.qr.application.dto.PayQrRequest;
import com.juanbenevento.ledger.qr.application.dto.PayQrResponse;
import com.juanbenevento.ledger.qr.application.port.input.PayQrUseCase;
import com.juanbenevento.ledger.qr.domain.model.QrCode;
import com.juanbenevento.ledger.qr.domain.port.QrCodeRepository;
import com.juanbenevento.ledger.qr.domain.port.QrPayloadSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PayQrService implements PayQrUseCase {

    private final QrCodeRepository qrCodeRepository;
    private final QrPayloadSigner qrPayloadSigner;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public PayQrResponse execute(PayQrRequest request) {
        // 1. Find the QR code
        QrCode qrCode = qrCodeRepository.findById(request.qrCodeId())
                .orElseThrow(() -> new IllegalArgumentException("QR Code not found: " + request.qrCodeId()));

        // 2. Verify HMAC signature
        if (!qrPayloadSigner.verify(buildVerificationPayload(qrCode), request.hmacPayload())) {
            throw new IllegalArgumentException("Invalid QR code signature — possible tampering detected");
        }

        // 3. Check validity (single-use + expiration)
        if (!qrCode.isValidForPayment()) {
            if (qrCode.getStatus() == com.juanbenevento.ledger.qr.domain.model.QrCodeStatus.USED) {
                throw new IllegalStateException("QR Code has already been used");
            }
            throw new IllegalStateException("QR Code has expired");
        }

        // 4. Determine payment amount
        BigDecimal paymentAmount;
        if (qrCode.getType() == com.juanbenevento.ledger.qr.domain.model.QrType.DYNAMIC) {
            paymentAmount = qrCode.getAmount();
        } else {
            // FIXED QR: amount comes from request
            if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Amount is required for FIXED QR payments");
            }
            paymentAmount = request.amount();
        }

        // 5. Find accounts
        Account senderAccount = accountRepository.findById(request.payerWalletId())
                .orElseThrow(() -> new IllegalArgumentException("Sender wallet not found: " + request.payerWalletId()));

        Account recipientAccount = accountRepository.findById(qrCode.getWalletId())
                .orElseThrow(() -> new IllegalArgumentException("Recipient wallet not found: " + qrCode.getWalletId()));

        // 6. Verify sufficient funds
        if (senderAccount.getAvailableBalanceSnapshot().compareTo(paymentAmount) < 0) {
            throw new IllegalArgumentException("Insufficient funds. Available: " +
                    senderAccount.getAvailableBalanceSnapshot() + ", Required: " + paymentAmount);
        }

        // 7. Execute transfer
        UUID transactionId = UUID.randomUUID();
        String correlationId = "QR-PAY-" + transactionId;

        senderAccount.withdraw(paymentAmount);
        recipientAccount.credit(paymentAmount);

        accountRepository.save(senderAccount, correlationId, "QR_PAY_DEBIT");
        accountRepository.save(recipientAccount, correlationId, "QR_PAY_CREDIT");

        // 8. Mark QR as used (single-use invalidation)
        qrCode.markAsPaid(transactionId);
        qrCodeRepository.update(qrCode);

        return new PayQrResponse(
                transactionId,
                qrCode.getId(),
                paymentAmount,
                qrCode.getCurrency(),
                request.payerWalletId(),
                qrCode.getWalletId(),
                LocalDateTime.now()
        );
    }

    private String buildVerificationPayload(QrCode qrCode) {
        StringBuilder sb = new StringBuilder();
        sb.append("walletId=").append(qrCode.getWalletId());
        sb.append("&userId=").append(qrCode.getUserId());
        sb.append("&type=").append(qrCode.getType().name());
        if (qrCode.getType() == com.juanbenevento.ledger.qr.domain.model.QrType.DYNAMIC && qrCode.getAmount() != null) {
            sb.append("&amount=").append(qrCode.getAmount());
        }
        sb.append("&currency=").append(qrCode.getCurrency());
        return sb.toString();
    }
}
