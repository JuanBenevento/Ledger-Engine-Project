package com.juanbenevento.ledger.billpay.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.billpay.application.dto.BillPaymentResponse;
import com.juanbenevento.ledger.billpay.application.port.input.PayBillUseCase;
import com.juanbenevento.ledger.billpay.domain.model.BillPayment;
import com.juanbenevento.ledger.billpay.domain.model.Biller;
import com.juanbenevento.ledger.billpay.domain.port.BillPaymentRepository;
import com.juanbenevento.ledger.billpay.domain.port.BillerRepository;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayBillService implements PayBillUseCase {

    private final AccountRepository accountRepository;
    private final BillerRepository billerRepository;
    private final BillPaymentRepository billPaymentRepository;
    private final TransferUseCase transferUseCase;

    private static final UUID BILLER_SYSTEM_WALLET_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    @Transactional
    public BillPaymentResponse execute(PayBillCommand command) {
        log.info("Processing bill payment: walletId={}, billerId={}, amount={} {}",
                command.walletId(), command.billerId(), command.amount(), command.currency());

        // Validate biller exists and is active
        Biller biller = billerRepository.findById(command.billerId())
                .orElseThrow(() -> new IllegalArgumentException("Biller not found: " + command.billerId()));
        biller.ensureActive();

        // Validate sender wallet exists and has sufficient funds
        Account senderAccount = accountRepository.findById(command.walletId())
                .orElseThrow(() -> new AccountNotFoundException(command.walletId()));

        if (senderAccount.getAvailableBalanceSnapshot().compareTo(command.amount()) < 0) {
            throw new IllegalArgumentException("Insufficient funds. Balance: " +
                    senderAccount.getAvailableBalanceSnapshot() + ", Attempted: " + command.amount());
        }

        // Create bill payment aggregate
        BillPayment payment = BillPayment.create(
                UUID.randomUUID(),
                command.walletId(),
                command.billerId(),
                command.amount(),
                command.currency(),
                command.reference(),
                command.correlationId()
        );

        payment.startProcessing();
        billPaymentRepository.save(payment);

        // Execute the actual transfer via existing TransferUseCase
        TransactionResponse txResponse = transferUseCase.execute(new CreateTransferRequest(
                command.walletId(),
                BILLER_SYSTEM_WALLET_ID,
                command.amount(),
                command.currency(),
                "Bill Payment: " + biller.getName() + " - " + command.reference(),
                command.correlationId(),
                "BILL_PAY_SYSTEM"
        ));

        // Complete the bill payment
        payment.complete("Provider accepted: " + txResponse.transactionId());
        billPaymentRepository.update(payment);

        log.info("Bill payment completed: paymentId={}, txId={}", payment.getId(), txResponse.transactionId());

        return toResponse(payment);
    }

    private BillPaymentResponse toResponse(BillPayment payment) {
        return new BillPaymentResponse(
                payment.getId(),
                payment.getWalletId(),
                payment.getBillerId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getReference(),
                payment.getStatus().name(),
                payment.getProviderResponse(),
                payment.getCreatedAt(),
                payment.getCompletedAt()
        );
    }
}
