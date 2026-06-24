package com.juanbenevento.ledger.user.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmailAddressTest {

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef"; // 32 bytes hex for AES-256

    @Test
    @DisplayName("US-05: Should create an EmailAddress and encrypt the value")
    void shouldCreateEncryptedEmail() {
        EmailAddress email = EmailAddress.of("user@example.com", TEST_KEY);

        assertThat(email).isNotNull();
        assertThat(email.getPlaintext()).isEqualTo("user@example.com");
        assertThat(email.getEncryptedValue()).isNotEqualTo("user@example.com");
        assertThat(email.getEncryptedValue()).isNotBlank();
    }

    @Test
    @DisplayName("US-05: Should decrypt the email back to plaintext")
    void shouldDecryptEmail() {
        EmailAddress original = EmailAddress.of("test@domain.com", TEST_KEY);
        EmailAddress reconstituted = EmailAddress.reconstitute(original.getEncryptedValue(), TEST_KEY);

        assertThat(reconstituted.getPlaintext()).isEqualTo("test@domain.com");
    }

    @Test
    @DisplayName("US-05: Should reject null email")
    void shouldRejectNullEmail() {
        assertThatThrownBy(() -> EmailAddress.of(null, TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should reject blank email")
    void shouldRejectBlankEmail() {
        assertThatThrownBy(() -> EmailAddress.of("  ", TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should reject invalid email format")
    void shouldRejectInvalidEmailFormat() {
        assertThatThrownBy(() -> EmailAddress.of("not-an-email", TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should produce consistent encryption for same input")
    void shouldProduceConsistentEncryption() {
        EmailAddress first = EmailAddress.of("same@example.com", TEST_KEY);
        EmailAddress second = EmailAddress.of("same@example.com", TEST_KEY);

        // Encrypted values should differ (random IV) but decrypt to same plaintext
        assertThat(first.getEncryptedValue()).isNotEqualTo(second.getEncryptedValue());
        assertThat(first.getPlaintext()).isEqualTo(second.getPlaintext());
    }

    @Test
    @DisplayName("US-05: Should implement equals based on plaintext value")
    void shouldBeEqualForSamePlaintext() {
        EmailAddress first = EmailAddress.of("equal@example.com", TEST_KEY);
        EmailAddress second = EmailAddress.of("equal@example.com", TEST_KEY);

        assertThat(first).isEqualTo(second);
    }

    @Test
    @DisplayName("US-05: Should not be equal for different plaintext values")
    void shouldNotBeEqualForDifferentPlaintext() {
        EmailAddress first = EmailAddress.of("one@example.com", TEST_KEY);
        EmailAddress second = EmailAddress.of("two@example.com", TEST_KEY);

        assertThat(first).isNotEqualTo(second);
    }
}
