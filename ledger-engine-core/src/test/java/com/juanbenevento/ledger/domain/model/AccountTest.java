package com.juanbenevento.ledger.domain.model;

import com.juanbenevento.ledger.domain.exception.InsufficientFundsException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class AccountTest {
    @Test
    @DisplayName("US-01: Should create an account with zero balances and ACTIVE status")
    void shouldCreateAccountWithDefaultValues() {
        UUID id = UUID.randomUUID();
        String accountNumber = "ACC-001";
        Currency currency = Currency.of(Currency.Code.ARS);

        Account account = Account.create(id, accountNumber, currency);

        assertNotNull(account);
        assertEquals(id, account.getId());
        assertEquals(accountNumber, account.getAccountNumber());
        assertEquals(currency, account.getCurrency());

        assertEquals("0.0000", account.getAvailableBalance().toPlainString());
        assertEquals("0.0000", account.getAccountingBalance().toPlainString());
        assertEquals(AccountStatus.ACTIVE, account.getStatus());
    }

    @Test
    @DisplayName("RF-03: Should fail to debit when balance is insufficient")
    void shouldThrowExceptionWhenBalanceIsInsufficient() {
        Account account = Account.create(
                UUID.randomUUID(),
                "ACC-002",
                Currency.of("USD")
        );

        assertEquals("0.0000", account.getAvailableBalance().toPlainString());

        BigDecimal amountToDebit = new BigDecimal("100.00");

        assertThrows(
                InsufficientFundsException.class,
                () -> account.debit(amountToDebit)
        );
    }

    @Test
    @DisplayName("RF-02: Crediting an account increases available and accounting balance")
    void shouldCreditAccountSuccessfully(){
        Account account = Account.create(
                UUID.randomUUID(),
                "ACC-003",
                Currency.of("USD")
        );

        assertEquals("0.0000", account.getAvailableBalance().toPlainString());
        assertEquals("0.0000", account.getAccountingBalance().toPlainString());
        assertEquals(AccountStatus.ACTIVE, account.getStatus());

        BigDecimal amountToCredit = new BigDecimal("100.00");

        account.credit(amountToCredit);

        assertEquals("100.0000", account.getAvailableBalance().toPlainString());
        assertEquals("100.0000", account.getAccountingBalance().toPlainString());
    }

    @Test
    @DisplayName("RF-02: Debiting an account decreases balances after a previous credit")
    void shouldDebitAfterCredit(){
        Account account = Account.create(
                UUID.randomUUID(),
                "ACC-004",
                Currency.of("ARS")
        );

        assertEquals("0.0000", account.getAvailableBalance().toPlainString());
        assertEquals("0.0000", account.getAccountingBalance().toPlainString());
        assertEquals(AccountStatus.ACTIVE, account.getStatus());

        BigDecimal amountToCredit = new BigDecimal("100.00");

        account.credit(amountToCredit);

        assertEquals("100.0000", account.getAvailableBalance().toPlainString());
        assertEquals("100.0000", account.getAccountingBalance().toPlainString());

        BigDecimal amountToDebit = new BigDecimal("50.00");

        account.debit(amountToDebit);

        assertEquals("50.0000", account.getAvailableBalance().toPlainString());
        assertEquals("50.0000", account.getAccountingBalance().toPlainString());
    }

    @Test
    @DisplayName("RF-04: Should reject operations with negative amounts")
    void shouldRejectNegativeAmounts(){
        Account account = Account.create(
                UUID.randomUUID(),
                "ACC-005",
                Currency.of("EUR")
        );

        assertEquals(AccountStatus.ACTIVE, account.getStatus());

        BigDecimal amountToDebit = new BigDecimal("-100.00");

        assertThrows(
            IllegalArgumentException.class,
                () -> account.debit(amountToDebit)
        );
    }

    @Test
    @DisplayName("RF-04: Should reject operations with zero amount")
    void  shouldRejectZeroAmount(){
        Account account = Account.create(
                UUID.randomUUID(),
                "ACC-006",
                Currency.of("USD")
        );

        assertEquals(AccountStatus.ACTIVE, account.getStatus());

        assertThrows(
                IllegalArgumentException.class,
                () -> account.debit(BigDecimal.ZERO)
        );
    }
}
