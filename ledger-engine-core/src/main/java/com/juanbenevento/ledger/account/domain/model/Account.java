package com.juanbenevento.ledger.account.domain.model;

import com.juanbenevento.ledger.account.domain.exception.AccountNotActiveException;
import com.juanbenevento.ledger.common.domain.exception.InsufficientFundsException;
import com.juanbenevento.ledger.common.domain.model.Currency;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

public class Account {

    private static final int SCALE = 4;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_EVEN;

    private final UUID id;
    private final String accountNumber;
    private final Currency currency;

    private BigDecimal accountingBalanceSnapshot;
    private BigDecimal availableBalanceSnapshot;
    private AccountStatus status;
    private Long version;

    private Account(UUID id, String accountNumber, Currency currency) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.currency = currency;
        this.accountingBalanceSnapshot = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        this.availableBalanceSnapshot = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        this.status = AccountStatus.ACTIVE;
        this.version = 0L;
    }

    public static Account create(UUID id, String accountNumber, Currency currency) {
        return new Account(id, accountNumber, currency);
    }

    public static Account reconstitute(
            UUID id,
            String accountNumber,
            Currency currency,
            BigDecimal accountingBalance,
            BigDecimal availableBalance,
            AccountStatus status,
            Long version
    ) {
        Account account = new Account(id, accountNumber, currency);
        account.accountingBalanceSnapshot = accountingBalance;
        account.availableBalanceSnapshot = availableBalance;
        account.status = status;
        account.version = version;
        return account;
    }

    public void debit(BigDecimal amount) {
        ensureIsActive();
        BigDecimal normalized = validateAndNormalize(amount);

        if (this.availableBalanceSnapshot.compareTo(normalized) < 0) {
            throw new InsufficientFundsException();
        }

        this.availableBalanceSnapshot = this.availableBalanceSnapshot.subtract(normalized);
        this.accountingBalanceSnapshot = this.accountingBalanceSnapshot.subtract(normalized);
    }

    public void credit(BigDecimal amount) {
        ensureIsActive();
        BigDecimal normalized = validateAndNormalize(amount);

        this.availableBalanceSnapshot = this.availableBalanceSnapshot.add(normalized);
        this.accountingBalanceSnapshot = this.accountingBalanceSnapshot.add(normalized);
    }

    private void ensureIsActive() {
        if (this.status != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(this.status);
        }
    }

    private BigDecimal validateAndNormalize(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        return amount.setScale(SCALE, ROUNDING);
    }

    public UUID getId() {
        return id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public Currency getCurrency() {
        return currency;
    }

    public BigDecimal getAccountingBalanceSnapshot() {
        return accountingBalanceSnapshot;
    }

    public BigDecimal getAvailableBalanceSnapshot() {
        return availableBalanceSnapshot;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public Long getVersion() {
        return version;
    }
}