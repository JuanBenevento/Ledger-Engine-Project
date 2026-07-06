package com.juanbenevento.ledger.p2p.domain.model;

import com.juanbenevento.ledger.p2p.domain.event.P2pTransferCompletedEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class P2pTransferTest {

    @Test
    @DisplayName("US-14: Should create a P2P transfer with PENDING status")
    void shouldCreateP2pTransfer() {
        UUID id = UUID.randomUUID();
        UUID senderWallet = UUID.randomUUID();
        UUID senderUser = UUID.randomUUID();
        UUID recipientWallet = UUID.randomUUID();
        UUID recipientUser = UUID.randomUUID();

        P2pTransfer transfer = P2pTransfer.create(id, senderWallet, senderUser,
                recipientWallet, recipientUser, new BigDecimal("50000.00"), "COP",
                "Lunch money", "CORR-P2P-001");

        assertThat(transfer).isNotNull();
        assertThat(transfer.getId()).isEqualTo(id);
        assertThat(transfer.getSenderWalletId()).isEqualTo(senderWallet);
        assertThat(transfer.getRecipientWalletId()).isEqualTo(recipientWallet);
        assertThat(transfer.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(transfer.getCurrency()).isEqualTo("COP");
        assertThat(transfer.getNote()).isEqualTo("Lunch money");
        assertThat(transfer.getStatus()).isEqualTo(P2pTransferStatus.PENDING);
        assertThat(transfer.getVersion()).isEqualTo(0L);
    }

    @Test
    @DisplayName("US-14: Should reconstitute P2P transfer from persistence")
    void shouldReconstituteP2pTransfer() {
        UUID id = UUID.randomUUID();
        UUID senderWallet = UUID.randomUUID();
        UUID senderUser = UUID.randomUUID();
        UUID recipientWallet = UUID.randomUUID();
        UUID recipientUser = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        P2pTransfer transfer = P2pTransfer.reconstitute(id, senderWallet, senderUser,
                recipientWallet, recipientUser, new BigDecimal("100000.00"), "COP",
                "Rent", "CORR-P2P-002", P2pTransferStatus.COMPLETED,
                null, now, now, 3L);

        assertThat(transfer.getId()).isEqualTo(id);
        assertThat(transfer.getStatus()).isEqualTo(P2pTransferStatus.COMPLETED);
        assertThat(transfer.getCompletedAt()).isNotNull();
        assertThat(transfer.getVersion()).isEqualTo(3L);
    }

    @Test
    @DisplayName("US-14: Should transition from PENDING to PROCESSING")
    void shouldTransitionToProcessing() {
        P2pTransfer transfer = createDefaultTransfer();

        transfer.startProcessing();

        assertThat(transfer.getStatus()).isEqualTo(P2pTransferStatus.PROCESSING);
    }

    @Test
    @DisplayName("US-14: Should transition from PROCESSING to COMPLETED and emit event")
    void shouldCompleteAndEmitEvent() {
        P2pTransfer transfer = createDefaultTransfer();
        transfer.startProcessing();

        P2pTransferCompletedEvent event = transfer.complete();

        assertThat(transfer.getStatus()).isEqualTo(P2pTransferStatus.COMPLETED);
        assertThat(transfer.getCompletedAt()).isNotNull();
        assertThat(event).isNotNull();
        assertThat(event.transferId()).isEqualTo(transfer.getId());
        assertThat(event.amount()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("US-14: Should transition from PROCESSING to FAILED")
    void shouldTransitionToFailed() {
        P2pTransfer transfer = createDefaultTransfer();
        transfer.startProcessing();

        transfer.fail("Insufficient funds");

        assertThat(transfer.getStatus()).isEqualTo(P2pTransferStatus.FAILED);
        assertThat(transfer.getFailureReason()).isEqualTo("Insufficient funds");
    }

    @Test
    @DisplayName("US-14: Should reject invalid status transition (PENDING → COMPLETE)")
    void shouldRejectInvalidStatusTransition() {
        P2pTransfer transfer = createDefaultTransfer();

        assertThatThrownBy(transfer::complete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot complete");
    }

    @Test
    @DisplayName("US-14: Should reject same sender and recipient wallet")
    void shouldRejectSameWallet() {
        UUID walletId = UUID.randomUUID();

        assertThatThrownBy(() -> P2pTransfer.create(
                UUID.randomUUID(), walletId, UUID.randomUUID(),
                walletId, UUID.randomUUID(),
                new BigDecimal("10000.00"), "COP", null, "CORR-001"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Sender and recipient wallets must be different");
    }

    @Test
    @DisplayName("US-14: Should reject null amount")
    void shouldRejectNullAmount() {
        assertThatThrownBy(() -> P2pTransfer.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                UUID.randomUUID(), UUID.randomUUID(),
                null, "COP", null, "CORR-002"))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("US-14: Should reject negative amount")
    void shouldRejectNegativeAmount() {
        assertThatThrownBy(() -> P2pTransfer.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("-100.00"), "COP", null, "CORR-003"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be positive");
    }

    private P2pTransfer createDefaultTransfer() {
        return P2pTransfer.create(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                UUID.randomUUID(), UUID.randomUUID(),
                new BigDecimal("50000.00"), "COP", "Test transfer", "CORR-P2P-TEST");
    }
}
