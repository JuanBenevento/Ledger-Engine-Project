package com.juanbenevento.ledger.user.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserTest {

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef";

    @Test
    @DisplayName("US-05: Should create a user with PENDING_KYC status")
    void shouldCreateUserWithPendingKycStatus() {
        UUID id = UUID.randomUUID();
        EmailAddress email = EmailAddress.of("user@test.com", TEST_KEY);
        PhoneNumber phone = PhoneNumber.of("+573001234567", TEST_KEY);

        User user = User.create(id, email, phone, "Juan", "Benevento");

        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmailAddress()).isEqualTo(email);
        assertThat(user.getPhoneNumber()).isEqualTo(phone);
        assertThat(user.getFirstName()).isEqualTo("Juan");
        assertThat(user.getLastName()).isEqualTo("Benevento");
        assertThat(user.getStatus()).isEqualTo(UserStatus.PENDING_KYC);
        assertThat(user.getVersion()).isEqualTo(0L);
    }

    @Test
    @DisplayName("US-05: Should reconstitute user from persistence")
    void shouldReconstituteUser() {
        UUID id = UUID.randomUUID();
        EmailAddress email = EmailAddress.of("reconstitute@test.com", TEST_KEY);
        PhoneNumber phone = PhoneNumber.of("+573009876543", TEST_KEY);

        User user = User.reconstitute(id, email, phone, "Jane", "Doe", UserStatus.ACTIVE, 5L);

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getFirstName()).isEqualTo("Jane");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getVersion()).isEqualTo(5L);
    }

    @Test
    @DisplayName("US-05: Should transition from PENDING_KYC to KYC_SUBMITTED")
    void shouldTransitionToKycSubmitted() {
        User user = User.create(UUID.randomUUID(),
                EmailAddress.of("t@test.com", TEST_KEY),
                PhoneNumber.of("+573001112222", TEST_KEY),
                "Test", "User");

        user.submitKyc();

        assertThat(user.getStatus()).isEqualTo(UserStatus.KYC_SUBMITTED);
    }

    @Test
    @DisplayName("US-05: Should transition from KYC_SUBMITTED to KYC_APPROVED")
    void shouldTransitionToKycApproved() {
        User user = User.create(UUID.randomUUID(),
                EmailAddress.of("t2@test.com", TEST_KEY),
                PhoneNumber.of("+573002223333", TEST_KEY),
                "Test", "User");
        user.submitKyc();

        user.approveKyc();

        assertThat(user.getStatus()).isEqualTo(UserStatus.KYC_APPROVED);
    }

    @Test
    @DisplayName("US-05: Should transition from KYC_APPROVED to ACTIVE")
    void shouldTransitionToActive() {
        User user = User.create(UUID.randomUUID(),
                EmailAddress.of("t3@test.com", TEST_KEY),
                PhoneNumber.of("+573003334444", TEST_KEY),
                "Test", "User");
        user.submitKyc();
        user.approveKyc();

        user.activate();

        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    @DisplayName("US-05: Should reject invalid status transition (PENDING_KYC → ACTIVE)")
    void shouldRejectInvalidStatusTransition() {
        User user = User.create(UUID.randomUUID(),
                EmailAddress.of("t4@test.com", TEST_KEY),
                PhoneNumber.of("+573004445555", TEST_KEY),
                "Test", "User");

        assertThatThrownBy(user::activate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot activate");
    }

    @Test
    @DisplayName("US-05: Should suspend an active user")
    void shouldSuspendUser() {
        User user = User.create(UUID.randomUUID(),
                EmailAddress.of("t5@test.com", TEST_KEY),
                PhoneNumber.of("+573005556666", TEST_KEY),
                "Test", "User");
        user.submitKyc();
        user.approveKyc();
        user.activate();

        user.suspend("fraud_suspected");

        assertThat(user.getStatus()).isEqualTo(UserStatus.SUSPENDED);
    }

    @Test
    @DisplayName("US-05: Should reject null email on creation")
    void shouldRejectNullEmail() {
        assertThatThrownBy(() -> User.create(UUID.randomUUID(),
                null,
                PhoneNumber.of("+573007778888", TEST_KEY),
                "Test", "User"))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("US-05: Should reject blank first name")
    void shouldRejectBlankFirstName() {
        assertThatThrownBy(() -> User.create(UUID.randomUUID(),
                EmailAddress.of("t7@test.com", TEST_KEY),
                PhoneNumber.of("+573007779999", TEST_KEY),
                "", "User"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("First name");
    }
}
