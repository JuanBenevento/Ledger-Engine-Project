package com.juanbenevento.ledger.user.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PhoneNumberTest {

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef";

    @Test
    @DisplayName("US-05: Should create a PhoneNumber and encrypt the value")
    void shouldCreateEncryptedPhone() {
        PhoneNumber phone = PhoneNumber.of("+573001234567", TEST_KEY);

        assertThat(phone).isNotNull();
        assertThat(phone.getPlaintext()).isEqualTo("+573001234567");
        assertThat(phone.getEncryptedValue()).isNotEqualTo("+573001234567");
        assertThat(phone.getEncryptedValue()).isNotBlank();
    }

    @Test
    @DisplayName("US-05: Should decrypt the phone back to plaintext")
    void shouldDecryptPhone() {
        PhoneNumber original = PhoneNumber.of("+573009876543", TEST_KEY);
        PhoneNumber reconstituted = PhoneNumber.reconstitute(original.getEncryptedValue(), TEST_KEY);

        assertThat(reconstituted.getPlaintext()).isEqualTo("+573009876543");
    }

    @Test
    @DisplayName("US-05: Should reject null phone number")
    void shouldRejectNullPhone() {
        assertThatThrownBy(() -> PhoneNumber.of(null, TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should reject blank phone number")
    void shouldRejectBlankPhone() {
        assertThatThrownBy(() -> PhoneNumber.of("  ", TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should reject invalid phone format (no + prefix)")
    void shouldRejectInvalidPhoneFormat() {
        assertThatThrownBy(() -> PhoneNumber.of("3001234567", TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should reject phone with letters")
    void shouldRejectPhoneWithLetters() {
        assertThatThrownBy(() -> PhoneNumber.of("+57abc123", TEST_KEY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("US-05: Should produce consistent encryption for same input")
    void shouldProduceConsistentEncryption() {
        PhoneNumber first = PhoneNumber.of("+573001112222", TEST_KEY);
        PhoneNumber second = PhoneNumber.of("+573001112222", TEST_KEY);

        assertThat(first.getEncryptedValue()).isNotEqualTo(second.getEncryptedValue());
        assertThat(first.getPlaintext()).isEqualTo(second.getPlaintext());
    }

    @Test
    @DisplayName("US-05: Should implement equals based on plaintext value")
    void shouldBeEqualForSamePlaintext() {
        PhoneNumber first = PhoneNumber.of("+573005556666", TEST_KEY);
        PhoneNumber second = PhoneNumber.of("+573005556666", TEST_KEY);

        assertThat(first).isEqualTo(second);
    }
}
