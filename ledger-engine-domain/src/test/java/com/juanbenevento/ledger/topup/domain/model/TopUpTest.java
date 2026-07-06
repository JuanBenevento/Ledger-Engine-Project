package com.juanbenevento.ledger.topup.domain.model;

import com.juanbenevento.ledger.topup.domain.event.TopUpCompletedEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TopUpTest {

    @Test
    @DisplayName("US-10: Should create a top-up with PENDING status")
    void shouldCreateTopUp() {
        UUID id = UUID.randomUUID();
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        TopUp topUp = TopUp.create(id, walletId, userId,
                new BigDecimal("50000.00"), "COP", TopUpMethod.CARD);

        assertThat(topUp).isNotNull();
        assertThat(topUp.getId()).isEqualTo(id);
        assertThat(topUp.getWalletId()).isEqualTo(walletId);
        assertThat(topUp.getUserId()).isEqualTo(userId);
        assertThat(topUp.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(topUp.getCurrency()).isEqualTo("COP");
        assertThat(topUp.getMethod()).isEqualTo(TopUpMethod.CARD);
        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.PENDING);
        assertThat(topUp.getVersion()).isEqualTo(0L);
        assertThat(topUp.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("US-10: Should reconstitute top-up from persistence")
    void shouldReconstituteTopUp() {
        UUID id = UUID.randomUUID();
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        TopUp topUp = TopUp.reconstitute(id, walletId, userId,
                new BigDecimal("100000.00"), "COP", TopUpMethod.PSE,
                TopUpStatus.COMPLETED, "EXT-REF-123", null, "REF-CODE-456",
                now.plusHours(24), now, now, 5L);

        assertThat(topUp.getId()).isEqualTo(id);
        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.COMPLETED);
        assertThat(topUp.getExternalReference()).isEqualTo("EXT-REF-123");
        assertThat(topUp.getReferenceCode()).isEqualTo("REF-CODE-456");
        assertThat(topUp.getVersion()).isEqualTo(5L);
    }

    @Test
    @DisplayName("US-10: Should transition from PENDING to PROCESSING")
    void shouldTransitionToProcessing() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("25000.00"), "COP", TopUpMethod.CARD);

        topUp.startProcessing();

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.PROCESSING);
    }

    @Test
    @DisplayName("US-10: Should transition from PROCESSING to COMPLETED and emit event")
    void shouldCompleteAndEmitEvent() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("75000.00"), "COP", TopUpMethod.CARD);
        topUp.startProcessing();

        TopUpCompletedEvent event = topUp.complete("stripe-chg-abc123");

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.COMPLETED);
        assertThat(topUp.getExternalReference()).isEqualTo("stripe-chg-abc123");
        assertThat(topUp.getCompletedAt()).isNotNull();
        assertThat(event).isNotNull();
        assertThat(event.topUpId()).isEqualTo(topUp.getId());
        assertThat(event.amount()).isEqualByComparingTo(new BigDecimal("75000.00"));
    }

    @Test
    @DisplayName("US-10: Should transition from PROCESSING to FAILED")
    void shouldTransitionToFailed() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("30000.00"), "COP", TopUpMethod.CARD);
        topUp.startProcessing();

        topUp.fail("Payment declined by issuer");

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.FAILED);
        assertThat(topUp.getFailureReason()).isEqualTo("Payment declined by issuer");
    }

    @Test
    @DisplayName("US-10: Should expire a PENDING top-up")
    void shouldExpirePendingTopUp() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("10000.00"), "COP", TopUpMethod.CASH);

        topUp.expire();

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.EXPIRED);
    }

    @Test
    @DisplayName("US-10: Should expire a PROCESSING top-up")
    void shouldExpireProcessingTopUp() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("10000.00"), "COP", TopUpMethod.PSE);
        topUp.startProcessing();

        topUp.expire();

        assertThat(topUp.getStatus()).isEqualTo(TopUpStatus.EXPIRED);
    }

    @Test
    @DisplayName("US-10: Should reject invalid status transition (PENDING → COMPLETE)")
    void shouldRejectInvalidStatusTransition() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("20000.00"), "COP", TopUpMethod.CARD);

        assertThatThrownBy(() -> topUp.complete("ref"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot complete");
    }

    @Test
    @DisplayName("US-10: Should reject null amount on creation")
    void shouldRejectNullAmount() {
        assertThatThrownBy(() -> TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, "COP", TopUpMethod.CARD))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("US-10: Should reject negative amount on creation")
    void shouldRejectNegativeAmount() {
        assertThatThrownBy(() -> TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("-100.00"), "COP", TopUpMethod.CARD))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be positive");
    }

    @Test
    @DisplayName("US-10: Should reject zero amount on creation")
    void shouldRejectZeroAmount() {
        assertThatThrownBy(() -> TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                BigDecimal.ZERO, "COP", TopUpMethod.CARD))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be positive");
    }

    @Test
    @DisplayName("US-10: Should set reference code and expiry for cash top-up")
    void shouldSetCashTopUpFields() {
        TopUp topUp = TopUp.create(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("50000.00"), "COP", TopUpMethod.CASH);

        topUp.setReferenceCode("ABCD1234");
        topUp.setExpiresAt(LocalDateTime.now().plusHours(24));

        assertThat(topUp.getReferenceCode()).isEqualTo("ABCD1234");
        assertThat(topUp.getExpiresAt()).isNotNull();
    }
}
