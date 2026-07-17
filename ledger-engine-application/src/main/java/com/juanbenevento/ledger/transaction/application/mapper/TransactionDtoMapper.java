package com.juanbenevento.ledger.transaction.application.mapper;

import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.transaction.application.dto.TransactionResponse;
import com.juanbenevento.ledger.transaction.domain.model.JournalEntry;
import com.juanbenevento.ledger.transaction.domain.model.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TransactionDtoMapper {

    public TransactionResponse toResponse(Transaction transaction, Account source, Account target) {

        BigDecimal transactionAmount = extractAmountForAccount(transaction, source);

        return new TransactionResponse(
                transaction.getId(),
                transaction.getCorrelationId(),
                transaction.getType(),
                "COMPLETED",
                transaction.getCreatedAt(),
                transactionAmount,
                source.getCurrency().code().name(),
                transaction.getDescription(),
                source.getAvailableBalanceSnapshot(),
                target.getAvailableBalanceSnapshot()
        );
    }

    private BigDecimal extractAmountForAccount(Transaction transaction, Account account) {
        return transaction.getEntries().stream()
                .filter(entry -> entry.getAccountId().equals(account.getId()))
                .map(JournalEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
