package com.juanbenevento.ledger.notification.application.service;

import com.juanbenevento.ledger.notification.application.dto.NotificationResponse;
import com.juanbenevento.ledger.notification.application.port.input.NotificationUseCase;
import com.juanbenevento.ledger.notification.domain.model.Notification;
import com.juanbenevento.ledger.notification.domain.model.NotificationType;
import com.juanbenevento.ledger.notification.domain.port.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository);
    }

    @Test
    @DisplayName("US-20: Should create notification successfully")
    void shouldCreateNotification() {
        UUID userId = UUID.randomUUID();

        var command = new NotificationUseCase.CreateNotificationCommand(
                userId, "TOPUP_COMPLETED", "Top-up Complete", "Your top-up was successful");

        NotificationResponse response = notificationService.createNotification(command);

        assertThat(response).isNotNull();
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.type()).isEqualTo("TOPUP_COMPLETED");
        assertThat(response.title()).isEqualTo("Top-up Complete");
        assertThat(response.isRead()).isFalse();

        verify(notificationRepository).save(any());
    }

    @Test
    @DisplayName("US-20: Should get inbox for user")
    void shouldGetInbox() {
        UUID userId = UUID.randomUUID();

        Notification notification1 = Notification.create(UUID.randomUUID(), userId,
                NotificationType.TOPUP_COMPLETED, "Top-up Complete", "message1");
        Notification notification2 = Notification.create(UUID.randomUUID(), userId,
                NotificationType.P2P_RECEIVED, "Payment Received", "message2");

        when(notificationRepository.findByUserId(userId)).thenReturn(List.of(notification1, notification2));

        List<NotificationResponse> inbox = notificationService.getInbox(userId);

        assertThat(inbox).hasSize(2);
        assertThat(inbox.get(0).type()).isEqualTo("TOPUP_COMPLETED");
        assertThat(inbox.get(1).type()).isEqualTo("P2P_RECEIVED");
    }

    @Test
    @DisplayName("US-20: Should mark notification as read")
    void shouldMarkAsRead() {
        UUID notificationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Notification notification = Notification.create(notificationId, userId,
                NotificationType.BILL_PAID, "Bill Paid", "Your bill was paid");

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        NotificationResponse response = notificationService.markAsRead(notificationId, userId);

        assertThat(response.isRead()).isTrue();
        verify(notificationRepository).update(notification);
    }

    @Test
    @DisplayName("US-20: Should reject markAsRead when notification not found")
    void shouldRejectWhenNotFound() {
        UUID notificationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(notificationId, userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Notification not found");
    }

    @Test
    @DisplayName("US-20: Should reject markAsRead when notification belongs to different user")
    void shouldRejectWhenNotOwner() {
        UUID notificationId = UUID.randomUUID();
        UUID ownerUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        Notification notification = Notification.create(notificationId, ownerUserId,
                NotificationType.SECURITY_ALERT, "Security Alert", "message");

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markAsRead(notificationId, otherUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to user");
    }
}
