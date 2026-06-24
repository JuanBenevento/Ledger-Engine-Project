package com.juanbenevento.ledger.billpay.domain.model;

import com.juanbenevento.ledger.billpay.domain.event.BillPaymentCompletedEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BillPaymentTest {

    @Test
    @DisplayName("US-19: Should create a bill payment with PENDING status")
    void shouldCreateBillPayment() {
        UUID id = UUID.randomUUID();
        UUID walletId = UUID.randomUUID();
        UUID billerId = UUID.randomUUID();

        BillPayment payment = BillPayment.create(id, walletId, billerId,
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-001");

        assertThat(payment).isNotNull();
        assertThat(payment.getId()).isEqualTo(id);
        assertThat(payment.getWalletId()).isEqualTo(walletId);
        assertThat(payment.getBillerId()).isEqualTo(billerId);
        assertThat(payment.getAmount()).isEqualByComparingTo(new BigDecimal("150000.00"));
        assertThat(payment.getCurrency()).isEqualTo("COP");
        assertThat(payment.getReference()).isEqualTo("REF-001");
        assertThat(payment.getStatus()).isEqualTo(BillPaymentStatus.PENDING);
        assertThat(payment.getVersion()).isEqualTo(0L);
    }

    @Test
    @DisplayName("US-19: Should reconstitute bill payment from persistence")
    void shouldReconstituteBillPayment() {
        UUID id = UUID.randomUUID();
        UUID walletId = UUID.randomUUID();
        UUID billerId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        BillPayment payment = BillPayment.reconstitute(id, walletId, billerId,
                new BigDecimal("200000.00"), "COP", "REF-002", "CORR-BILL-002",
                BillPaymentStatus.COMPLETED, "Provider accepted", now, now, 2L);

        assertThat(payment.getId()).isEqualTo(id);
        assertThat(payment.getStatus()).isEqualTo(BillPaymentStatus.COMPLETED);
        assertThat(payment.getProviderResponse()).isEqualTo("Provider accepted");
        assertThat(payment.getCompletedAt()).isNotNull();
        assertThat(payment.getVersion()).isEqualTo(2L);
    }

    @Test
    @DisplayName("US-19: Should transition from PENDING to PROCESSING")
    void shouldTransitionToProcessing() {
        BillPayment payment = createDefaultPayment();

        payment.startProcessing();

        assertThat(payment.getStatus()).isEqualTo(BillPaymentStatus.PROCESSING);
    }

    @Test
    @DisplayName("US-19: Should transition from PROCESSING to COMPLETED and emit event")
    void shouldCompleteAndEmitEvent() {
        BillPayment payment = createDefaultPayment();
        payment.startProcessing();

        BillPaymentCompletedEvent event = payment.complete("Provider accepted: TX-001");

        assertThat(payment.getStatus()).isEqualTo(BillPaymentStatus.COMPLETED);
        assertThat(payment.getProviderResponse()).isEqualTo("Provider accepted: TX-001");
        assertThat(payment.getCompletedAt()).isNotNull();
        assertThat(event).isNotNull();
        assertThat(event.paymentId()).isEqualTo(payment.getId());
        assertThat(event.amount()).isEqualByComparingTo(new BigDecimal("150000.00"));
    }

    @Test
    @DisplayName("US-19: Should transition from PROCESSING to FAILED")
    void shouldTransitionToFailed() {
        BillPayment payment = createDefaultPayment();
        payment.startProcessing();

        payment.fail("Provider rejected");

        assertThat(payment.getStatus()).isEqualTo(BillPaymentStatus.FAILED);
        assertThat(payment.getProviderResponse()).isEqualTo("Provider rejected");
    }

    @Test
    @DisplayName("US-19: Should reject invalid status transition (PENDING → COMPLETE)")
    void shouldRejectInvalidStatusTransition() {
        BillPayment payment = createDefaultPayment();

        assertThatThrownBy(() -> payment.complete("test"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot complete");
    }

    @Test
    @DisplayName("US-19: Should reject null amount")
    void shouldRejectNullAmount() {
        assertThatThrownBy(() -> BillPayment.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, "COP", "REF-001", "CORR-001"))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("US-19: Should reject negative amount")
    void shouldRejectNegativeAmount() {
        assertThatThrownBy(() -> BillPayment.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("-100.00"), "COP", "REF-001", "CORR-001"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be positive");
    }

    @Test
    @DisplayName("US-19: Should reject zero amount")
    void shouldRejectZeroAmount() {
        assertThatThrownBy(() -> BillPayment.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                BigDecimal.ZERO, "COP", "REF-001", "CORR-001"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be positive");
    }

    private BillPayment createDefaultPayment() {
        return BillPayment.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("150000.00"), "COP", "REF-001", "CORR-BILL-TEST");
    }
}
