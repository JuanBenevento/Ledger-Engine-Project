package com.juanbenevento.ledger.transaction.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.DepositUseCase;
import com.juanbenevento.ledger.transaction.application.port.output.TransactionRepository;
import com.juanbenevento.ledger.transaction.domain.exception.TransactionAlreadyProcessedException;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntry;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepositService implements DepositUseCase {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    // ID Técnico de la Bóveda (Activo del Banco).
    // En producción, esto vendría de un VaultProvider o configuración.
    public static final UUID BANK_VAULT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    @Transactional
    public TransactionResponse execute(DepositCommand command) {
        if (transactionRepository.existsByCorrelationId(command.correlationId())) {
            throw new TransactionAlreadyProcessedException(command.correlationId());
        }

        Account targetAccount = accountRepository.findById(command.targetAccountId())
                .orElseThrow(() -> new AccountNotFoundException(command.targetAccountId()));

        if (!targetAccount.getCurrency().code().name().equals(command.currency())) {
            throw new IllegalArgumentException("Currency mismatch: Account is " +
                    targetAccount.getCurrency() + " but deposit is " + command.currency());
        }

        JournalEntry vaultEntry = JournalEntry.create(
                BANK_VAULT_ID,
                command.amount(),
                Currency.of(command.currency()),
                JournalEntryType.DEBIT
        );

        JournalEntry userEntry = JournalEntry.create(
                targetAccount.getId(),
                command.amount(),
                Currency.of(command.currency()),
                JournalEntryType.CREDIT
        );

        Transaction transaction = Transaction.create(
                command.correlationId(),
                command.description(),
                TransactionType.DEPOSIT,
                List.of(vaultEntry, userEntry)
        );

        targetAccount.credit(command.amount());

        accountRepository.update(targetAccount, "DEPOSIT_SYS");
        transactionRepository.save(transaction, "DEPOSIT_SYS");

        log.info("Deposit processed. TxID: {}", transaction.getId());

        return new TransactionResponse(
                transaction.getId(),
                transaction.getCorrelationId(),
                transaction.getType(),
                "COMPLETED",
                transaction.getCreatedAt(),
                transaction.getTotalAmount(),
                command.currency(),
                transaction.getDescription(),
                null,
                targetAccount.getAvailableBalanceSnapshot()
        );
    }
}
