package com.juanbenevento.ledger.user.application.service;

import com.juanbenevento.ledger.user.application.dto.RegisterUserRequest;
import com.juanbenevento.ledger.user.application.dto.RegisterUserResponse;
import com.juanbenevento.ledger.user.domain.model.User;
import com.juanbenevento.ledger.user.domain.model.UserStatus;
import com.juanbenevento.ledger.user.domain.port.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegisterUserServiceTest {

    @Mock
    private UserRepository userRepository;

    private RegisterUserService service;

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef";

    @BeforeEach
    void setUp() {
        service = new RegisterUserService(userRepository, TEST_KEY);
    }

    @Test
    @DisplayName("US-07: Should register a new user successfully")
    void shouldRegisterNewUser() {
        RegisterUserRequest request = new RegisterUserRequest(
                "user@test.com", "+573001234567", "Juan", "Benevento"
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);

        RegisterUserResponse response = service.execute(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isNotNull();
        assertThat(response.firstName()).isEqualTo("Juan");
        assertThat(response.lastName()).isEqualTo("Benevento");
        assertThat(response.status()).isEqualTo("PENDING_KYC");

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("US-07: Should reject duplicate email")
    void shouldRejectDuplicateEmail() {
        RegisterUserRequest request = new RegisterUserRequest(
                "existing@test.com", "+573001234567", "Juan", "Benevento"
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> service.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("US-07: Should reject duplicate phone")
    void shouldRejectDuplicatePhone() {
        RegisterUserRequest request = new RegisterUserRequest(
                "new@test.com", "+573009998888", "Juan", "Benevento"
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(true);

        assertThatThrownBy(() -> service.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Phone already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("US-07: Should persist user with PENDING_KYC status")
    void shouldPersistWithPendingKycStatus() {
        RegisterUserRequest request = new RegisterUserRequest(
                "kyc@test.com", "+573001112222", "Test", "User"
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);

        RegisterUserResponse response = service.execute(request);

        assertThat(response.status()).isEqualTo(UserStatus.PENDING_KYC.name());

        verify(userRepository).save(argThat(user ->
                user.getStatus() == UserStatus.PENDING_KYC
        ));
    }
}
