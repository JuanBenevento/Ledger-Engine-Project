package com.juanbenevento.ledger.security.domain.model;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TwoFactorAuthTest {

    @Test
    void shouldCreateTwoFactorAuth() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String secretKey = "JBSWY3DPEHPK3PXP";

        // When
        TwoFactorAuth tfa = TwoFactorAuth.create(id, userId, secretKey);

        // Then
        assertThat(tfa.getId()).isEqualTo(id);
        assertThat(tfa.getUserId()).isEqualTo(userId);
        assertThat(tfa.getSecretKey()).isEqualTo(secretKey);
        assertThat(tfa.isEnabled()).isFalse();
        assertThat(tfa.getBackupCodes()).isEmpty();
        assertThat(tfa.getVersion()).isEqualTo(0L);
    }

    @Test
    void shouldEnableTwoFactorAuth() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");

        // When
        tfa.enable();

        // Then
        assertThat(tfa.isEnabled()).isTrue();
        assertThat(tfa.getBackupCodes()).hasSize(10);
    }

    @Test
    void shouldDisableTwoFactorAuth() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");
        tfa.enable();

        // When
        tfa.disable();

        // Then
        assertThat(tfa.isEnabled()).isFalse();
        assertThat(tfa.getBackupCodes()).isEmpty();
    }

    @Test
    void shouldThrowWhenEnablingAlreadyEnabled() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");
        tfa.enable();

        // When & Then
        assertThatThrownBy(tfa::enable)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already enabled");
    }

    @Test
    void shouldThrowWhenDisablingNotEnabled() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");

        // When & Then
        assertThatThrownBy(tfa::disable)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not enabled");
    }

    @Test
    void shouldConsumeBackupCode() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");
        tfa.enable();
        List<String> backupCodes = tfa.getBackupCodes();
        String firstCode = backupCodes.get(0);

        // When
        boolean consumed = tfa.consumeBackupCode(firstCode);

        // Then
        assertThat(consumed).isTrue();
        assertThat(tfa.getBackupCodes()).hasSize(9);
        assertThat(tfa.getBackupCodes()).doesNotContain(firstCode);
    }

    @Test
    void shouldReturnFalseForInvalidBackupCode() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");
        tfa.enable();

        // When
        boolean consumed = tfa.consumeBackupCode("INVALID");

        // Then
        assertThat(consumed).isFalse();
    }

    @Test
    void shouldRecordUsage() {
        // Given
        TwoFactorAuth tfa = TwoFactorAuth.create(
                UUID.randomUUID(), UUID.randomUUID(), "JBSWY3DPEHPK3PXP");
        assertThat(tfa.getLastUsedAt()).isNull();

        // When
        tfa.recordUsage();

        // Then
        assertThat(tfa.getLastUsedAt()).isNotNull();
    }

    @Test
    void shouldReconstituteFromPersistence() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String secretKey = "JBSWY3DPEHPK3PXP";
        List<String> backupCodes = List.of("CODE1", "CODE2", "CODE3");

        // When
        TwoFactorAuth tfa = TwoFactorAuth.reconstitute(
                id, userId, secretKey, true, backupCodes,
                java.time.Instant.now(), java.time.Instant.now(), 1L);

        // Then
        assertThat(tfa.getId()).isEqualTo(id);
        assertThat(tfa.getUserId()).isEqualTo(userId);
        assertThat(tfa.getSecretKey()).isEqualTo(secretKey);
        assertThat(tfa.isEnabled()).isTrue();
        assertThat(tfa.getBackupCodes()).hasSize(3);
        assertThat(tfa.getVersion()).isEqualTo(1L);
    }
}