package com.juanbenevento.ledger.topup.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CashTopUpUseCase;
import com.juanbenevento.ledger.topup.application.port.output.PaymentPort;
import com.juanbenevento.ledger.topup.domain.event.TopUpCompletedEvent;
import com.juanbenevento.ledger.topup.domain.model.TopUp;
import com.juanbenevento.ledger.topup.domain.model.TopUpMethod;
import com.juanbenevento.ledger.topup.domain.model.TopUpStatus;
import com.juanbenevento.ledger.topup.domain.port.TopUpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CashTopUpService implements CashTopUpUseCase {

    private final AccountRepository accountRepository;
    private final TopUpRepository topUpRepository;
    private final PaymentPort paymentPort;

    private static final int CASH_EXPIRY_HOURS = 24;

    @Override
    @Transactional
    public TopUpResponse initiate(CashTopUpCommand command) {
        log.info("Initiating cash top-up: walletId={}, amount={} {}", command.walletId(), command.amount(), command.currency());

        Account account = accountRepository.findById(command.walletId())
                .orElseThrow(() -> new AccountNotFoundException(command.walletId()));

        TopUp topUp = TopUp.create(
                UUID.randomUUID(),
                command.walletId(),
                command.userId(),
                command.amount(),
                command.currency(),
                TopUpMethod.CASH
        );

        // Generate 8-character alphanumeric reference code
        String referenceCode = paymentPort.generateCashReference(command.amount(), command.currency());
        topUp.setReferenceCode(referenceCode);

        // Set 24-hour expiry
        topUp.setExpiresAt(LocalDateTime.now().plusHours(CASH_EXPIRY_HOURS));

        topUpRepository.save(topUp);

        log.info("Cash top-up initiated: topUpId={}, referenceCode={}, expiresAt={}",
                topUp.getId(), referenceCode, topUp.getExpiresAt());

        return toResponse(topUp);
    }

    @Override
    @Transactional
    public TopUpResponse confirm(UUID topUpId) {
        log.info("Confirming cash top-up: topUpId={}", topUpId);

        TopUp topUp = topUpRepository.findById(topUpId)
                .orElseThrow(() -> new RuntimeException("TopUp not found: " + topUpId));

        if (topUp.getStatus() != TopUpStatus.PENDING) {
            throw new IllegalStateException(
                    "Cannot confirm top-up in status: " + topUp.getStatus() + ". Expected PENDING.");
        }

        // Check expiry
        if (topUp.getExpiresAt() != null && topUp.getExpiresAt().isBefore(LocalDateTime.now())) {
            topUp.expire();
            topUpRepository.update(topUp);
            throw new IllegalStateException("Top-up has expired. Reference code: " + topUp.getReferenceCode());
        }

        topUp.startProcessing();
        TopUpCompletedEvent event = topUp.complete("CASH-CONFIRMED");

        Account account = accountRepository.findById(topUp.getWalletId())
                .orElseThrow(() -> new AccountNotFoundException(topUp.getWalletId()));

        account.credit(topUp.getAmount());
        accountRepository.update(account, "TOPUP_CASH");

        topUpRepository.update(topUp);

        log.info("Cash top-up confirmed: topUpId={}, walletId={}", topUp.getId(), topUp.getWalletId());

        return toResponse(topUp);
    }

    private TopUpResponse toResponse(TopUp topUp) {
        return new TopUpResponse(
                topUp.getId(),
                topUp.getWalletId(),
                topUp.getAmount(),
                topUp.getCurrency(),
                topUp.getMethod().name(),
                topUp.getStatus().name(),
                topUp.getReferenceCode(),
                topUp.getCreatedAt(),
                topUp.getCompletedAt()
        );
    }
}
