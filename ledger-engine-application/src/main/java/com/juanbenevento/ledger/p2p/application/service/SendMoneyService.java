package com.juanbenevento.ledger.p2p.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.p2p.application.dto.P2pTransferResponse;
import com.juanbenevento.ledger.p2p.application.port.input.SendMoneyUseCase;
import com.juanbenevento.ledger.p2p.domain.model.LookupType;
import com.juanbenevento.ledger.p2p.domain.model.P2pTransfer;
import com.juanbenevento.ledger.p2p.domain.model.P2pTransferStatus;
import com.juanbenevento.ledger.p2p.domain.model.RecipientInfo;
import com.juanbenevento.ledger.p2p.domain.port.P2pTransferRepository;
import com.juanbenevento.ledger.p2p.domain.port.RecipientLookupPort;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendMoneyService implements SendMoneyUseCase {

    private final AccountRepository accountRepository;
    private final P2pTransferRepository p2pTransferRepository;
    private final RecipientLookupPort recipientLookupPort;
    private final TransferUseCase transferUseCase;
    private final DailyLimitService dailyLimitService;

    private static final BigDecimal DAILY_LIMIT_COP = new BigDecimal("2000000.00");

    @Override
    @Transactional
    public P2pTransferResponse execute(SendMoneyCommand command) {
        log.info("Processing P2P transfer: senderWalletId={}, recipient={}, amount={} {}",
                command.senderWalletId(), command.recipientIdentifier(), command.amount(), command.currency());

        // Check daily limit
        BigDecimal dailyTotal = dailyLimitService.getDailyTotal(command.senderUserId(), command.currency());
        BigDecimal newTotal = dailyTotal.add(command.amount());
        BigDecimal limit = getDailyLimit(command.currency());

        if (newTotal.compareTo(limit) > 0) {
            throw new IllegalStateException(
                    "Daily transfer limit exceeded. Current: " + dailyTotal + ", Attempted: " +
                            command.amount() + ", Limit: " + limit);
        }

        // Lookup recipient
        LookupType lookupType = LookupType.valueOf(command.lookupType());
        RecipientInfo recipient = recipientLookupPort.lookup(command.recipientIdentifier(), lookupType)
                .orElseThrow(() -> new RuntimeException(
                        "Recipient not found: " + command.recipientIdentifier()));

        // Validate sender wallet exists and has sufficient funds
        Account senderAccount = accountRepository.findById(command.senderWalletId())
                .orElseThrow(() -> new AccountNotFoundException(command.senderWalletId()));

        if (senderAccount.getAvailableBalanceSnapshot().compareTo(command.amount()) < 0) {
            throw new IllegalArgumentException("Insufficient funds. Balance: " +
                    senderAccount.getAvailableBalanceSnapshot() + ", Attempted: " + command.amount());
        }

        // Create P2P transfer aggregate
        P2pTransfer transfer = P2pTransfer.create(
                UUID.randomUUID(),
                command.senderWalletId(),
                command.senderUserId(),
                recipient.walletId(),
                recipient.userId(),
                command.amount(),
                command.currency(),
                command.note(),
                command.correlationId()
        );

        transfer.startProcessing();
        p2pTransferRepository.save(transfer);

        // Execute the actual transfer via existing TransferUseCase
        TransactionResponse txResponse = transferUseCase.execute(new CreateTransferRequest(
                command.senderWalletId(),
                recipient.walletId(),
                command.amount(),
                command.currency(),
                "P2P Transfer: " + (command.note() != null ? command.note() : ""),
                command.correlationId(),
                "P2P_SYSTEM"
        ));

        // Complete the P2P transfer
        transfer.complete();
        p2pTransferRepository.update(transfer);

        // Update daily limit
        dailyLimitService.recordTransfer(command.senderUserId(), command.amount(), command.currency());

        log.info("P2P transfer completed: transferId={}, txId={}", transfer.getId(), txResponse.transactionId());

        return toResponse(transfer);
    }

    private BigDecimal getDailyLimit(String currency) {
        // Default limit in COP; other currencies would have equivalent limits
        if ("COP".equals(currency)) {
            return DAILY_LIMIT_COP;
        }
        return new BigDecimal("10000.00"); // Default for other currencies
    }

    private P2pTransferResponse toResponse(P2pTransfer transfer) {
        return new P2pTransferResponse(
                transfer.getId(),
                transfer.getSenderWalletId(),
                transfer.getRecipientWalletId(),
                transfer.getAmount(),
                transfer.getCurrency(),
                transfer.getStatus().name(),
                transfer.getNote(),
                transfer.getCreatedAt(),
                transfer.getCompletedAt()
        );
    }
}
