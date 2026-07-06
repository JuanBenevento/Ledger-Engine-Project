package com.juanbenevento.ledger.user.application.service;

import com.juanbenevento.ledger.user.application.dto.KycApprovedResponse;
import com.juanbenevento.ledger.user.application.port.output.WalletCreationPort;
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
class ApproveKycServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletCreationPort walletCreationPort;

    private ApproveKycService service;

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef";

    @BeforeEach
    void setUp() {
        service = new ApproveKycService(userRepository, walletCreationPort);
    }

    @Test
    @DisplayName("US-08: Should approve KYC and auto-create PRIMARY wallet")
    void shouldApproveKycAndCreateWallet() {
        UUID userId = UUID.randomUUID();
        User user = User.create(userId,
                com.juanbenevento.ledger.user.domain.model.EmailAddress.of("approve@test.com", TEST_KEY),
                com.juanbenevento.ledger.user.domain.model.PhoneNumber.of("+573001234567", TEST_KEY),
                "Test", "User");
        user.submitKyc();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(walletCreationPort.createPrimaryWallet(any(UUID.class), any(String.class)))
                .thenReturn(new com.juanbenevento.ledger.user.application.dto.WalletInfo(
                        UUID.randomUUID(), "PRIMARY", "COP"));

        KycApprovedResponse response = service.execute(userId);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("ACTIVE");
        assertThat(response.wallet()).isNotNull();
        assertThat(response.wallet().walletType()).isEqualTo("PRIMARY");

        verify(userRepository).update(argThat(u -> u.getStatus() == UserStatus.ACTIVE));
        verify(walletCreationPort).createPrimaryWallet(eq(userId), any(String.class));
    }

    @Test
    @DisplayName("US-08: Should reject approval for non-KYC_SUBMITTED user")
    void shouldRejectApprovalForPendingUser() {
        UUID userId = UUID.randomUUID();
        User user = User.create(userId,
                com.juanbenevento.ledger.user.domain.model.EmailAddress.of("pending@test.com", TEST_KEY),
                com.juanbenevento.ledger.user.domain.model.PhoneNumber.of("+573009876543", TEST_KEY),
                "Test", "User");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.execute(userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot approve KYC");

        verify(walletCreationPort, never()).createPrimaryWallet(any(), any());
    }
}
