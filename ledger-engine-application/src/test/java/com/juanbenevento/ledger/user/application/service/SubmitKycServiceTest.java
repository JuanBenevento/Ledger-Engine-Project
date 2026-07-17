package com.juanbenevento.ledger.user.application.service;

import com.juanbenevento.ledger.user.application.dto.KycStatusResponse;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmitKycServiceTest {

    @Mock
    private UserRepository userRepository;

    private SubmitKycService service;

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef";

    @BeforeEach
    void setUp() {
        service = new SubmitKycService(userRepository);
    }

    @Test
    @DisplayName("US-08: Should submit KYC for user with PENDING_KYC status")
    void shouldSubmitKyc() {
        UUID userId = UUID.randomUUID();
        User user = User.create(userId,
                com.juanbenevento.ledger.user.domain.model.EmailAddress.of("kyc@test.com", TEST_KEY),
                com.juanbenevento.ledger.user.domain.model.PhoneNumber.of("+573001234567", TEST_KEY),
                "Test", "User");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        KycStatusResponse response = service.execute(userId);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("KYC_SUBMITTED");

        verify(userRepository).update(argThat(u -> u.getStatus() == UserStatus.KYC_SUBMITTED));
    }

    @Test
    @DisplayName("US-08: Should reject KYC submission for non-PENDING_KYC user")
    void shouldRejectKycSubmissionForActiveUser() {
        UUID userId = UUID.randomUUID();
        User user = User.create(userId,
                com.juanbenevento.ledger.user.domain.model.EmailAddress.of("active@test.com", TEST_KEY),
                com.juanbenevento.ledger.user.domain.model.PhoneNumber.of("+573009876543", TEST_KEY),
                "Test", "User");
        user.submitKyc();
        user.approveKyc();
        user.activate();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.execute(userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot submit KYC");

        verify(userRepository, never()).update(any());
    }

    @Test
    @DisplayName("US-08: Should throw when user not found")
    void shouldThrowWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.execute(userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }
}
