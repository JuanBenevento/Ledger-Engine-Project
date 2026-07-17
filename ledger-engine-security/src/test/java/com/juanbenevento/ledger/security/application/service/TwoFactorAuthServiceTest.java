package com.juanbenevento.ledger.security.application.service;

import com.juanbenevento.ledger.security.application.dto.DisableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.TwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.VerifyTwoFactorRequest;
import com.juanbenevento.ledger.security.domain.model.TwoFactorAuth;
import com.juanbenevento.ledger.security.domain.port.TwoFactorAuthRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TwoFactorAuthServiceTest {

    @Mock
    private TwoFactorAuthRepository twoFactorAuthRepository;

    @InjectMocks
    private TwoFactorAuthService twoFactorAuthService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void shouldEnableTwoFactorAuth() {
        // Given
        EnableTwoFactorRequest request = new EnableTwoFactorRequest(userId, "password123");
        when(twoFactorAuthRepository.existsByUserId(userId)).thenReturn(false);

        // When
        EnableTwoFactorResponse response = twoFactorAuthService.execute(request);

        // Then
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.secretKey()).isNotBlank();
        assertThat(response.qrCodeUri()).isNotBlank();
        assertThat(response.backupCodes()).hasSize(10);
        verify(twoFactorAuthRepository).save(any(TwoFactorAuth.class));
    }

    @Test
    void shouldThrowWhenEnablingAlreadyEnabled() {
        // Given
        EnableTwoFactorRequest request = new EnableTwoFactorRequest(userId, "password123");
        when(twoFactorAuthRepository.existsByUserId(userId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> twoFactorAuthService.execute(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already enabled");
        verify(twoFactorAuthRepository, never()).save(any());
    }

    @Test
    void shouldVerifyBackupCode() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(UUID.randomUUID(), userId, "JBSWY3DPEHPK3PXP");
        tfa.enable();
        String backupCode = tfa.getBackupCodes().get(0);

        when(twoFactorAuthRepository.findByUserId(userId)).thenReturn(Optional.of(tfa));

        VerifyTwoFactorRequest request = new VerifyTwoFactorRequest(userId, backupCode);

        // When
        TwoFactorResponse response = twoFactorAuthService.execute(request);

        // Then
        assertThat(response.enabled()).isTrue();
        assertThat(response.message()).contains("Backup code verified");
        verify(twoFactorAuthRepository).update(tfa);
    }

    @Test
    void shouldThrowWhenVerifyingWithInvalidCode() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(UUID.randomUUID(), userId, "JBSWY3DPEHPK3PXP");
        tfa.enable();

        when(twoFactorAuthRepository.findByUserId(userId)).thenReturn(Optional.of(tfa));

        VerifyTwoFactorRequest request = new VerifyTwoFactorRequest(userId, "INVALID");

        // When & Then
        assertThatThrownBy(() -> twoFactorAuthService.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid 2FA code");
    }

    @Test
    void shouldDisableTwoFactorAuth() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(UUID.randomUUID(), userId, "JBSWY3DPEHPK3PXP");
        tfa.enable();

        when(twoFactorAuthRepository.findByUserId(userId)).thenReturn(Optional.of(tfa));

        DisableTwoFactorRequest request = new DisableTwoFactorRequest(userId, "password123");

        // When
        TwoFactorResponse response = twoFactorAuthService.execute(request);

        // Then
        assertThat(response.enabled()).isFalse();
        assertThat(response.message()).contains("disabled successfully");
        verify(twoFactorAuthRepository).update(tfa);
    }

    @Test
    void shouldThrowWhenDisablingNotEnabled() {
        // Given
        when(twoFactorAuthRepository.findByUserId(userId)).thenReturn(Optional.empty());

        DisableTwoFactorRequest request = new DisableTwoFactorRequest(userId, "password123");

        // When & Then
        assertThatThrownBy(() -> twoFactorAuthService.execute(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not enabled");
    }
}