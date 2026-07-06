package com.juanbenevento.ledger.notification.application.port.input;

import com.juanbenevento.ledger.notification.application.dto.NotificationResponse;

import java.util.List;
import java.util.UUID;

/**
 * Use case for notification operations.
 */
public interface NotificationUseCase {

    /**
     * Create a new notification for a user.
     */
    NotificationResponse createNotification(CreateNotificationCommand command);

    /**
     * Get all notifications for a user (inbox).
     */
    List<NotificationResponse> getInbox(UUID userId);

    /**
     * Mark a notification as read.
     */
    NotificationResponse markAsRead(UUID notificationId, UUID userId);

    record CreateNotificationCommand(
            UUID userId,
            String type,
            String title,
            String message
    ) {}
}
