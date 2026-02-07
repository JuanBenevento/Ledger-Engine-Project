package com.juanbenevento.ledger.integration;


import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.account.domain.model.AccountStatus;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.port.in.CreateAccountUseCase;
import com.juanbenevento.ledger.account.application.port.in.UpdateAccountStatusUseCase;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotActiveException;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.port.in.DepositUseCase;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import com.juanbenevento.ledger.transaction.application.service.DepositService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT)
@Testcontainers
class AccountLifecycleIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired private CreateAccountUseCase createAccountUseCase;
    @Autowired private DepositUseCase depositUseCase;
    @Autowired private TransferUseCase transferUseCase;
    @Autowired private UpdateAccountStatusUseCase accountStatusUseCase;
    @Autowired private AccountRepository accountRepository;

    @BeforeEach
    void setUp() {
        ensureBankVaultExists();
    }

    @Test
    @DisplayName("Lifecycle: Create -> Deposit -> Freeze -> Transfer(Fail) -> Activate -> Transfer(Success)")
    void fullAccountLifecycleScenario() {
        // 1.
        UUID aliceId = createAccount("ALICE-VIP");
        UUID bobId = createAccount("BOB-REGULAR");

        deposit(aliceId, "1000.00");

        // 2.
        accountStatusUseCase.freeze(aliceId, "Suspicious Activity detected via ML");

        // 3.
        assertThatThrownBy(() ->
                transferUseCase.execute(new CreateTransferRequest(
                        aliceId, bobId, new BigDecimal("100.00"), "USD", "Bribe", "TX-FAIL", "APP"
                ))
        ).isInstanceOf(AccountNotActiveException.class);

        assertThat(getBalance(aliceId)).isEqualByComparingTo("1000.0000");

        // 4.
        accountStatusUseCase.activate(aliceId);

        // 5.
        transferUseCase.execute(new CreateTransferRequest(
                aliceId, bobId, new BigDecimal("100.00"), "USD", "Legal Payment", "TX-OK", "APP"
        ));

        // 6.
        assertThat(getBalance(aliceId)).isEqualByComparingTo("900.0000"); // 1000 - 100
        assertThat(getBalance(bobId)).isEqualByComparingTo("100.0000");   // 0 + 100
    }

    // --- Helpers ---

    private UUID createAccount(String number) {
        return createAccountUseCase.execute(
                new CreateAccountRequest(number, "USD", "C-" + number, "TEST")
        ).id();
    }

    private void deposit(UUID accountId, String amount) {
        depositUseCase.execute(new DepositUseCase.DepositCommand(
                accountId, new BigDecimal(amount), "USD", "Funding", "DEP-" + UUID.randomUUID()
        ));
    }

    private BigDecimal getBalance(UUID accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new AssertionError("Account not found in DB"))
                .getAvailableBalanceSnapshot();
    }

    private void ensureBankVaultExists() {
        UUID vaultId = DepositService.BANK_VAULT_ID;

        if (accountRepository.findById(vaultId).isEmpty()) {

            Account vaultAccount = Account.reconstitute(
                    vaultId,
                    "BANK-VAULT-001",
                    Currency.of("USD"),
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    AccountStatus.ACTIVE,
                    null
            );

            accountRepository.save(vaultAccount, "INIT-VAULT", "SYSTEM_BOOTSTRAP");
        }
    }
}