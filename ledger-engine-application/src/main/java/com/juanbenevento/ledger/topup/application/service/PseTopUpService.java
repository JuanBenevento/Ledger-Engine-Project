package com.juanbenevento.ledger.topup.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.topup.application.dto.PseTopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.PseTopUpUseCase;
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
public class PseTopUpService implements PseTopUpUseCase {

    private final AccountRepository accountRepository;
    private final TopUpRepository topUpRepository;
    private final PaymentPort paymentPort;

    private static final int PSE_EXPIRY_HOURS = 24;

    @Override
    @Transactional
    public PseTopUpResponse initiate(PseTopUpCommand command) {
        log.info("Initiating PSE top-up: walletId={}, amount={} {}", command.walletId(), command.amount(), command.currency());

        Account account = accountRepository.findById(command.walletId())
                .orElseThrow(() -> new AccountNotFoundException(command.walletId()));

        TopUp topUp = TopUp.create(
                UUID.randomUUID(),
                command.walletId(),
                command.userId(),
                command.amount(),
                command.currency(),
                TopUpMethod.PSE
        );

        topUp.startProcessing();

        String redirectUrl = paymentPort.initiatePseRedirect(
                command.amount(),
                command.currency(),
                "/api/v1/webhooks/topup/pse",
                command.correlationId()
        );

        topUp.setExternalReference(command.correlationId());
        topUp.setExpiresAt(LocalDateTime.now().plusHours(PSE_EXPIRY_HOURS));

        topUpRepository.save(topUp);

        log.info("PSE top-up initiated: topUpId={}, redirectUrl={}", topUp.getId(), redirectUrl);

        return new PseTopUpResponse(
                topUp.getId(),
                topUp.getWalletId(),
                topUp.getAmount(),
                topUp.getCurrency(),
                topUp.getMethod().name(),
                topUp.getStatus().name(),
                redirectUrl,
                topUp.getExpiresAt(),
                topUp.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public void confirmCallback(String externalReference, boolean success, String failureReason) {
        log.info("Processing PSE callback: externalReference={}, success={}", externalReference, success);

        TopUp topUp = topUpRepository.findByExternalReference(externalReference)
                .orElseThrow(() -> new RuntimeException("TopUp not found for external reference: " + externalReference));

        if (topUp.getStatus() != TopUpStatus.PROCESSING) {
            log.warn("TopUp {} is in status {}, ignoring callback", topUp.getId(), topUp.getStatus());
            return;
        }

        if (success) {
            TopUpCompletedEvent event = topUp.complete(externalReference);

            Account account = accountRepository.findById(topUp.getWalletId())
                    .orElseThrow(() -> new AccountNotFoundException(topUp.getWalletId()));

            account.credit(topUp.getAmount());
            accountRepository.update(account, "TOPUP_PSE");

            topUpRepository.update(topUp);

            log.info("PSE top-up completed: topUpId={}", topUp.getId());
        } else {
            topUp.fail(failureReason);
            topUpRepository.update(topUp);

            log.warn("PSE top-up failed: topUpId={}, reason={}", topUp.getId(), failureReason);
        }
    }
}
