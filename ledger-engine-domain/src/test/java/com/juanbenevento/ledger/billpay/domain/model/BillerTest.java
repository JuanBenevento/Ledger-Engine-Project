package com.juanbenevento.ledger.billpay.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BillerTest {

    @Test
    @DisplayName("US-19: Should create an active biller")
    void shouldCreateActiveBiller() {
        UUID id = UUID.randomUUID();
        Biller biller = Biller.create(id, "EPM", "UTILITIES", "1234567890");

        assertThat(biller).isNotNull();
        assertThat(biller.getId()).isEqualTo(id);
        assertThat(biller.getName()).isEqualTo("EPM");
        assertThat(biller.getCategory()).isEqualTo("UTILITIES");
        assertThat(biller.getAccountNumber()).isEqualTo("1234567890");
        assertThat(biller.isActive()).isTrue();
    }

    @Test
    @DisplayName("US-19: Should reconstitute inactive biller")
    void shouldReconstituteInactiveBiller() {
        UUID id = UUID.randomUUID();
        Biller biller = Biller.reconstitute(id, "ETB", "TELECOM", "9876543210", false);

        assertThat(biller.isActive()).isFalse();
    }

    @Test
    @DisplayName("US-19: Should pass ensureActive for active biller")
    void shouldPassEnsureActive() {
        Biller biller = Biller.create(UUID.randomUUID(), "EPM", "UTILITIES", "123");

        biller.ensureActive(); // Should not throw
    }

    @Test
    @DisplayName("US-19: Should throw on ensureActive for inactive biller")
    void shouldThrowOnEnsureActive() {
        Biller biller = Biller.reconstitute(UUID.randomUUID(), "EPM", "UTILITIES", "123", false);

        assertThatThrownBy(biller::ensureActive)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Biller is not active");
    }

    @Test
    @DisplayName("US-19: Should reject null name")
    void shouldRejectNullName() {
        assertThatThrownBy(() -> Biller.create(UUID.randomUUID(), null, "UTILITIES", "123"))
                .isInstanceOf(NullPointerException.class);
    }
}
