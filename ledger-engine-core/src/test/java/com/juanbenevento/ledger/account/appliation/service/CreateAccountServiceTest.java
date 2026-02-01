package com.juanbenevento.ledger.account.appliation.service;

import com.juanbenevento.ledger.account.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.account.application.mapper.AccountMapper;
import com.juanbenevento.ledger.account.application.service.CreateAccountService;
import com.juanbenevento.ledger.account.domain.exception.AccountAlreadyExistsException;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CreateAccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountMapper mapper;

    @InjectMocks
    private CreateAccountService createAccountService;

    private CreateAccountRequest accountRequest;

    @BeforeEach
    void setUp(){
        accountRequest = new CreateAccountRequest ("ACC-001", "USD", "corr-123", "TEST_SYSTEM");
    }

    @Test
    @DisplayName("A3: Should return existing account when correlationId already exists (Idempotency)")
    void shouldReturnExistingAccountWhenCorrelationIdExists() {
        Account existingAccount = mock(Account.class);
        when(accountRepository.findByCorrelationId("corr-123")).thenReturn(Optional.of(existingAccount));

        createAccountService.execute(accountRequest);

        verify(accountRepository, never()).existsByAccountNumber(anyString());
        verify(accountRepository, never()).save(any(), anyString(), anyString());
        verify(mapper).toResponse(existingAccount);
    }

    @Test
    @DisplayName("AC-e: Should throw AccountAlreadyExistsException when account number is taken")
    void ShowThrowExceptionWhenAccountNumberAlreadyExists(){
        when(accountRepository.findByCorrelationId(anyString())).thenReturn(Optional.empty());
        when(accountRepository.existsByAccountNumber("ACC-001")).thenReturn(true);

        assertThrows(
                AccountAlreadyExistsException.class,
                () -> {
                    createAccountService.execute(accountRequest);
                }
        );

        verify(accountRepository, never()).save(
                any(Account.class),
                eq("corr-123"),
                eq("TEST_SYSTEM")
        );
    }

    @Test
    @DisplayName("US-01: Should create account successfully when data is valid")
    void ShouldCreateAccountSuccessfully(){
        when(accountRepository.findByCorrelationId(anyString())).thenReturn(Optional.empty());
        when(accountRepository.existsByAccountNumber(anyString())).thenReturn(false);

        when(mapper.toDomain(any(UUID.class), any(CreateAccountRequest.class)))
                .thenReturn(mock(Account.class));

        createAccountService.execute(accountRequest);

        verify(accountRepository, times(1)).save(
                any(Account.class),
                eq("corr-123"),
                eq("TEST_SYSTEM")
        );
        verify(mapper, times(1)).toResponse(any());
    }
}
