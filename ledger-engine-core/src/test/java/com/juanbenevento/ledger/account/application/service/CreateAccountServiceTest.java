package com.juanbenevento.ledger.account.application.service;

import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.account.application.mapper.AccountDtoMapper;
import com.juanbenevento.ledger.account.application.service.CreateAccountService;
import com.juanbenevento.ledger.account.domain.exception.AccountAlreadyExistsException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.common.domain.model.Currency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateAccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountDtoMapper mapper;

    @InjectMocks
    private CreateAccountService createAccountService;

    private CreateAccountRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CreateAccountRequest(
                "ACC-001",
                "USD",
                "corr-123",
                "TEST_SYSTEM"
        );
    }

    @Test
    @DisplayName("A3: Should return existing account when correlationId already exists (Idempotency)")
    void shouldReturnExistingAccountWhenCorrelationIdExists() {
        Account existingAccount = Account.create(
                UUID.randomUUID(),
                "ACC-EXISTING",
                Currency.of("USD")
        );

        CreateAccountResponse expectedResponse = new CreateAccountResponse(
                existingAccount.getId(),
                "ACC-EXISTING",
                "USD",
                BigDecimal.ZERO,
                "corr-123"
        );

        when(accountRepository.findByCorrelationId("corr-123"))
                .thenReturn(Optional.of(existingAccount));

        when(mapper.toResponse(existingAccount)).thenReturn(expectedResponse);

        CreateAccountResponse response = createAccountService.execute(validRequest);

        assertThat(response).isEqualTo(expectedResponse);

        verify(accountRepository, never()).existsByAccountNumber(anyString());
        verify(accountRepository, never()).save(
                any(Account.class),
                anyString(),
                anyString()
        );
    }

    @Test
    @DisplayName("AC-E: Should throw AccountAlreadyExistsException when account number is taken")
    void shouldThrowExceptionWhenAccountNumberAlreadyExists() {
        when(accountRepository.findByCorrelationId(anyString())).thenReturn(Optional.empty());
        when(accountRepository.existsByAccountNumber("ACC-001")).thenReturn(true);

        assertThatThrownBy(() -> createAccountService.execute(validRequest))
                .isInstanceOf(AccountAlreadyExistsException.class)
                .hasMessageContaining("ACC-001"); // Validamos que el mensaje sea útil

        verify(accountRepository, never()).save(
                any(Account.class),
                anyString(),
                anyString()
        );
    }

    @Test
    @DisplayName("US-01: Should create and persist account successfully when data is valid")
    void shouldCreateAccountSuccessfully() {
        // 1. ARRANGE
        CreateAccountRequest validRequest = new CreateAccountRequest(
                "ACC-001", "USD", "corr-123", "TEST_SYSTEM"
        );

        when(accountRepository.findByCorrelationId("corr-123")).thenReturn(Optional.empty());
        when(accountRepository.existsByAccountNumber("ACC-001")).thenReturn(false);

        UUID generatedId = UUID.randomUUID();
        Account newAccount = Account.create(generatedId, "ACC-001", Currency.of("USD"));

        when(mapper.toDomain(any(UUID.class), eq(validRequest))).thenReturn(newAccount);

        CreateAccountResponse expectedResponse = new CreateAccountResponse(
                generatedId,
                "ACC-001",
                "USD",
                BigDecimal.ZERO.setScale(4),
                "ACTIVE"
        );
        when(mapper.toResponse(newAccount)).thenReturn(expectedResponse);

        // 2. ACT
        CreateAccountResponse response = createAccountService.execute(validRequest);

        // 3. ASSERT
        assertThat(response).isNotNull();
        assertThat(response.accountNumber()).isEqualTo("ACC-001");
        assertThat(response.status()).isEqualTo("ACTIVE");

        ArgumentCaptor<Account> accountCaptor = ArgumentCaptor.forClass(Account.class);

        verify(accountRepository).save(
                accountCaptor.capture(),
                eq("corr-123"),
                eq("TEST_SYSTEM")
        );

        Account capturedAccount = accountCaptor.getValue();
        assertThat(capturedAccount.getAccountNumber()).isEqualTo("ACC-001");
        assertThat(capturedAccount.getCurrency().code().name()).isEqualTo("USD");
    }
}
