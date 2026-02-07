package com.juanbenevento.ledger.account.infrastructure.adapter.in.controller;

import com.juanbenevento.ledger.account.application.port.in.CreateAccountUseCase;
import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.transaction.application.port.in.DepositUseCase;
import com.juanbenevento.ledger.transaction.application.port.in.TransferUseCase;
import com.juanbenevento.ledger.transaction.application.dto.CreateTransferRequest;
import com.juanbenevento.ledger.transaction.application.service.DepositService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class AccountHistoryE2ETest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private CreateAccountUseCase createAccountUseCase;
    @Autowired private TransferUseCase transferUseCase;
    @Autowired private DepositUseCase depositUseCase;
    @Autowired private AccountRepository accountRepository;

    @BeforeEach
    void setUpSystem() {
        ensureBankVaultExists();
    }

    @Test
    @DisplayName("E2E: Should reconstruct ledger history with correct running balances")
    void shouldReturnCorrectHistoryAndBalance() throws Exception {
        // 1. ARRANGE
        UUID accountId = createAccount("ACC-MAIN-01");
        UUID counterpartyId = createAccount("ACC-OTHER-02");

        deposit(counterpartyId, "10000.0000");

        // 2. ACT
        // T1
        transfer(counterpartyId, accountId, "100.00", "Funding", "TX-001");

        // T2
        transfer(accountId, counterpartyId, "25.50", "Service Payment", "TX-002");

        // T3
        transfer(counterpartyId, accountId, "0.50", "Adjustment", "TX-003");

        // 3. ASSERT
        mockMvc.perform(get("/api/v1/accounts/{id}/history", accountId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))

                // --- MOV 1
                .andExpect(jsonPath("$[0].correlationId", is("TX-001")))
                .andExpect(jsonPath("$[0].type", is("CREDIT")))
                .andExpect(jsonPath("$[0].amount", is(100.0)))
                .andExpect(jsonPath("$[0].runningBalance", is(100.0)))

                // --- MOV2
                .andExpect(jsonPath("$[1].correlationId", is("TX-002")))
                .andExpect(jsonPath("$[1].type", is("DEBIT")))
                .andExpect(jsonPath("$[1].amount", is(25.5)))
                .andExpect(jsonPath("$[1].runningBalance", is(74.5)))

                // --- MOV3
                .andExpect(jsonPath("$[2].correlationId", is("TX-003")))
                .andExpect(jsonPath("$[2].type", is("CREDIT")))
                .andExpect(jsonPath("$[2].amount", is(0.5)))
                .andExpect(jsonPath("$[2].runningBalance", is(75.0)));
    }

    private UUID createAccount(String number) {
        CreateAccountRequest request = new CreateAccountRequest(
                number, "USD", "CORR-" + number, "TEST_E2E"
        );
        CreateAccountResponse response = createAccountUseCase.execute(request);
        return response.id();
    }

    private void transfer(UUID from, UUID to, String amount, String desc, String correlationId) {
        transferUseCase.execute(new CreateTransferRequest(
                from, to, new BigDecimal(amount), "USD", desc, correlationId, "TEST_E2E"
        ));
    }

    private void deposit(UUID accountId, String amount) {
        depositUseCase.execute(new DepositUseCase.DepositCommand(
                accountId,
                new BigDecimal(amount),
                "USD",
                "Initial Deposit for Testing",
                "DEP-" + UUID.randomUUID()
        ));
    }

    private void ensureBankVaultExists() {
        UUID vaultId = DepositService.BANK_VAULT_ID;

        if (accountRepository.findById(vaultId).isEmpty()) {

            Account vaultAccount = Account.reconstitute(
                    vaultId,
                    "BANK-VAULT-001",
                    com.juanbenevento.ledger.common.domain.model.Currency.of("USD"),
                    BigDecimal.ZERO, // Saldo Contable inicial
                    BigDecimal.ZERO, // Saldo Disponible inicial
                    com.juanbenevento.ledger.account.domain.model.AccountStatus.ACTIVE,
                    null
            );

            accountRepository.save(vaultAccount, "INIT-VAULT", "SYSTEM_BOOTSTRAP");
        }
    }
}
