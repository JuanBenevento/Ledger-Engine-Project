package com.juanbenevento.ledger.account.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.exception.LedgerIntegrityException;
import com.juanbenevento.ledger.account.application.dto.AccountStatementResponse;
import com.juanbenevento.ledger.account.application.port.in.GetAccountHistoryUseCase;
import com.juanbenevento.ledger.transaction.application.port.output.JournalEntryRepository;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntryType;
import com.juanbenevento.ledger.transaction.domain.model.LedgerMovement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetAccountHistoryService implements GetAccountHistoryUseCase {
    private final JournalEntryRepository journalEntryRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AccountStatementResponse> execute(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(()-> new AccountNotFoundException(accountId));

        List<LedgerMovement> history = journalEntryRepository.findHistoryByAccountId(accountId);

        List<AccountStatementResponse> statementResponses = new ArrayList<>();

        BigDecimal accumulator = BigDecimal.ZERO.setScale(4);

        for (LedgerMovement move : history){
            if (move.type() == JournalEntryType.CREDIT){
                accumulator = accumulator.add(move.amount());
            }else {
                accumulator = accumulator.subtract(move.amount());
            }

            statementResponses.add(new AccountStatementResponse(
                    move.transactionId(),
                    move.correlationId(),
                    move.type().name(),
                    move.amount(),
                    accumulator,
                    move.bookedAt(),
                    move.createdBy()
            ));
        }

        if (accumulator.compareTo(account.getAccountingBalanceSnapshot()) != 0){
            throw new LedgerIntegrityException(
                    accountId,
                    accumulator,
                    account.getAccountingBalanceSnapshot()
            );
        }

        return statementResponses;
    }
}
