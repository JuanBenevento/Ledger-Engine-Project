package com.juanbenevento.ledger.account.domain.model;

import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.common.domain.exception.InsufficientFundsException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccountTest {

    @Test
    @DisplayName("US-01: Should create an account with zero balances and ACTIVE status")
    void shouldCreateAccountWithDefaultValues() {
        UUID id = UUID.randomUUID();
        String accountNumber = "ACC-001";
        Currency currency = Currency.of(Currency.Code.ARS);

        Account account = Account.create(id, accountNumber, currency);

        assertThat(account).isNotNull();
        assertThat(account.getId()).isEqualTo(id);
        assertThat(account.getAccountNumber()).isEqualTo(accountNumber);
        assertThat(account.getCurrency()).isEqualTo(currency);
        assertThat(account.getStatus()).isEqualTo(AccountStatus.ACTIVE);

        assertThat(account.getAvailableBalanceSnapshot()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(account.getAccountingBalanceSnapshot()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("RF-03: Should fail to debit when balance is insufficient (Golden Rule)")
    void shouldThrowExceptionWhenBalanceIsInsufficient() {
        Account account = Account.create(UUID.randomUUID(), "ACC-002", Currency.of("USD"));
        BigDecimal amountToDebit = new BigDecimal("100.00");

        assertThatThrownBy(() -> account.withdraw(amountToDebit))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessageContaining("insufficient funds");
    }

    @Test
    @DisplayName("RF-02: Crediting an account increases available and accounting balance")
    void shouldCreditAccountSuccessfully() {
        Account account = Account.create(UUID.randomUUID(), "ACC-003", Currency.of("USD"));
        BigDecimal amountToCredit = new BigDecimal("100.00");

        account.credit(amountToCredit);

        assertThat(account.getAvailableBalanceSnapshot())
                .isEqualByComparingTo(amountToCredit);
        assertThat(account.getAccountingBalanceSnapshot())
                .isEqualByComparingTo(amountToCredit);
    }

    @Test
    @DisplayName("RF-02: Debiting an account decreases balances after a previous credit")
    void shouldDebitAfterCredit() {
        Account account = Account.create(UUID.randomUUID(), "ACC-004", Currency.of("USD"));
        account.credit(new BigDecimal("100.00"));

        BigDecimal amountToDebit = new BigDecimal("40.00");

        account.withdraw(amountToDebit);

        BigDecimal expectedBalance = new BigDecimal("60.00");

        assertThat(account.getAvailableBalanceSnapshot())
                .as("Available balance should be reduced")
                .isEqualByComparingTo(expectedBalance);

        assertThat(account.getAccountingBalanceSnapshot())
                .as("Accounting balance should be reduced")
                .isEqualByComparingTo(expectedBalance);
    }

    @Test
    @DisplayName("RF-04: Should reject operations with negative amounts (Invariant Protection)")
    void shouldRejectNegativeAmounts() {
        Account account = Account.create(UUID.randomUUID(), "ACC-005", Currency.of("EUR"));
        BigDecimal negativeAmount = new BigDecimal("-10.00");


        assertThatThrownBy(() -> account.credit(negativeAmount))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("positive");

        assertThatThrownBy(() -> account.withdraw(negativeAmount))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("RF-04: Should reject operations with zero amount")
    void shouldRejectZeroAmount() {
        Account account = Account.create(UUID.randomUUID(), "ACC-006", Currency.of("EUR"));

        assertThatThrownBy(() -> account.credit(BigDecimal.ZERO))
                .isInstanceOf(RuntimeException.class);

        assertThatThrownBy(() -> account.withdraw(BigDecimal.ZERO))
                .isInstanceOf(RuntimeException.class);
    }
}
