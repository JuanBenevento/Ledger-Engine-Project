package com.juanbenevento.ledger.topup.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.topup.application.dto.TopUpResponse;
import com.juanbenevento.ledger.topup.application.port.input.CardTopUpUseCase;
import com.juanbenevento.ledger.topup.application.port.output.PaymentPort;
import com.juanbenevento.ledger.topup.domain.event.TopUpCompletedEvent;
import com.juanbenevento.ledger.topup.domain.model.TopUp;
import com.juanbenevento.ledger.topup.domain.model.TopUpMethod;
import com.juanbenevento.ledger.topup.domain.port.TopUpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CardTopUpService implements CardTopUpUseCase {

    private final AccountRepository accountRepository;
    private final TopUpRepository topUpRepository;
    private final PaymentPort paymentPort;

    @Override
    @Transactional
    public TopUpResponse execute(CardTopUpCommand command) {
        log.info("Processing card top-up: walletId={}, amount={} {}", command.walletId(), command.amount(), command.currency());

        Account account = accountRepository.findById(command.walletId())
                .orElseThrow(() -> new AccountNotFoundException(command.walletId()));

        TopUp topUp = TopUp.create(
                UUID.randomUUID(),
                command.walletId(),
                command.userId(),
                command.amount(),
                command.currency(),
                TopUpMethod.CARD
        );
        topUpRepository.save(topUp);

        topUp.startProcessing();

        String externalReference;
        try {
            externalReference = paymentPort.chargeCard(
                    command.cardToken(),
                    command.amount(),
                    command.currency(),
                    command.correlationId()
            );
        } catch (Exception e) {
            topUp.fail(e.getMessage());
            topUpRepository.update(topUp);
            log.error("Card top-up failed: topUpId={}, reason={}", topUp.getId(), e.getMessage());
            throw new RuntimeException("Payment processing failed: " + e.getMessage(), e);
        }

        TopUpCompletedEvent event = topUp.complete(externalReference);

        account.credit(command.amount());
        accountRepository.update(account, "TOPUP_CARD");

        topUpRepository.update(topUp);

        log.info("Card top-up completed: topUpId={}, walletId={}", topUp.getId(), command.walletId());

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
