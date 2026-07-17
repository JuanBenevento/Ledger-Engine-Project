package com.juanbenevento.ledger.transaction.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import com.juanbenevento.ledger.transaction.application.port.output.TransactionRepository;
import com.juanbenevento.ledger.transaction.domain.exception.InvalidTransactionException;
import com.juanbenevento.ledger.transaction.domain.exception.TransactionAlreadyProcessedException;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntry;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import com.juanbenevento.ledger.transaction.domain.model.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransferService implements TransferUseCase {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse execute(CreateTransferRequest request) {
        log.info("Processing transfer request: correlationId={}", request.correlationId());

        if (transactionRepository.existsByCorrelationId(request.correlationId())) {
            throw new TransactionAlreadyProcessedException(request.correlationId());
        }

        Account source = accountRepository.findById(request.sourceAccountId())
                .orElseThrow(() -> new AccountNotFoundException(request.sourceAccountId()));

        Account target = accountRepository.findById(request.targetAccountId())
                .orElseThrow(() -> new AccountNotFoundException(request.targetAccountId()));

        validateTransferRules(source, target, request);

        source.withdraw(request.amount());
        target.credit(request.amount());

        Transaction transaction = buildTransactionAggregate(request, source, target);

        try {
            transactionRepository.save(transaction, request.createdBy());
            accountRepository.update(source, request.createdBy());
            accountRepository.update(target, request.createdBy());

        } catch (DataIntegrityViolationException e) {
            log.warn("Concurrency race condition detected: Transaction with CorrelationID {} already exists. Reverting.", request.correlationId());

            throw new TransactionAlreadyProcessedException(request.correlationId());
        };

        log.info("Transfer completed successfully: trxId={}", transaction.getId());

        return TransactionResponse.from(transaction, source, target);
    }

    private void validateTransferRules(Account source, Account target, CreateTransferRequest request) {
        if (source.getId().equals(target.getId())) {
            throw new InvalidTransactionException("Source and target accounts must be different");
        }

        String requestCurrency = request.currency();

        if (!source.getCurrency().code().name().equals(requestCurrency)) {
            throw new InvalidTransactionException(
                    String.format("Source account currency (%s) does not match transfer currency (%s)",
                            source.getCurrency().code(), requestCurrency));
        }

        if (!target.getCurrency().code().name().equals(requestCurrency)) {
            throw new InvalidTransactionException(
                    String.format("Target account currency (%s) does not match transfer currency (%s)",
                            target.getCurrency().code(), requestCurrency));
        }
    }

    private Transaction buildTransactionAggregate(CreateTransferRequest request, Account source, Account target) {
        JournalEntry debitEntry = JournalEntry.create(
                source.getId(),
                request.amount(),
                Currency.of(request.currency()),
                JournalEntryType.DEBIT
        );

        JournalEntry creditEntry = JournalEntry.create(
                target.getId(),
                request.amount(),
                Currency.of(request.currency()),
                JournalEntryType.CREDIT
        );
        return Transaction.create(
                request.correlationId(),
                request.description(),
                TransactionType.TRANSFER,
                List.of(debitEntry, creditEntry)
        );
    }
}

