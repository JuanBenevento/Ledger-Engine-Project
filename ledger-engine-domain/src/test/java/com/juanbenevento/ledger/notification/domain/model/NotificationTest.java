package com.juanbenevento.ledger.notification.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationTest {

    @Test
    @DisplayName("US-20: Should create a notification with default unread status")
    void shouldCreateNotification() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Notification notification = Notification.create(id, userId, NotificationType.TOPUP_COMPLETED,
                "Top-up Complete", "Your top-up of 50000 COP was successful");

        assertThat(notification).isNotNull();
        assertThat(notification.getId()).isEqualTo(id);
        assertThat(notification.getUserId()).isEqualTo(userId);
        assertThat(notification.getType()).isEqualTo(NotificationType.TOPUP_COMPLETED);
        assertThat(notification.getTitle()).isEqualTo("Top-up Complete");
        assertThat(notification.getMessage()).contains("50000 COP");
        assertThat(notification.isRead()).isFalse();
        assertThat(notification.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("US-20: Should reconstitute notification from persistence")
    void shouldReconstituteNotification() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Notification notification = Notification.reconstitute(id, userId, NotificationType.P2P_RECEIVED,
                "Payment Received", "You received 10000 COP", true, now);

        assertThat(notification.isRead()).isTrue();
        assertThat(notification.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("US-20: Should mark notification as read")
    void shouldMarkAsRead() {
        Notification notification = Notification.create(UUID.randomUUID(), UUID.randomUUID(),
                NotificationType.BILL_PAID, "Bill Paid", "Your bill was paid");

        assertThat(notification.isRead()).isFalse();

        notification.markAsRead();

        assertThat(notification.isRead()).isTrue();
    }

    @Test
    @DisplayName("US-20: Should reject null userId")
    void shouldRejectNullUserId() {
        assertThatThrownBy(() -> Notification.create(
                UUID.randomUUID(), null, NotificationType.SECURITY_ALERT,
                "Security Alert", "Suspicious activity"))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("US-20: Should reject null title")
    void shouldRejectNullTitle() {
        assertThatThrownBy(() -> Notification.create(
                UUID.randomUUID(), UUID.randomUUID(), NotificationType.TOPUP_COMPLETED,
                null, "message"))
                .isInstanceOf(NullPointerException.class);
    }
}
