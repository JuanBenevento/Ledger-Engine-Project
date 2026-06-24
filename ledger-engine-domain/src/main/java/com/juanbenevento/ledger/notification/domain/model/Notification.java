package com.juanbenevento.ledger.notification.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Notification aggregate root.
 * Represents an in-app notification for a user.
 * Created when domain events occur (top-up completed, P2P received, bill paid, etc.).
 */
public class Notification {

    private final UUID id;
    private final UUID userId;
    private final NotificationType type;
    private final String title;
    private final String message;
    private boolean isRead;
    private final LocalDateTime createdAt;

    private Notification(UUID id, UUID userId, NotificationType type, String title, String message) {
        this.id = Objects.requireNonNull(id, "Notification ID must not be null");
        this.userId = Objects.requireNonNull(userId, "User ID must not be null");
        this.type = Objects.requireNonNull(type, "Notification type must not be null");
        this.title = Objects.requireNonNull(title, "Title must not be null");
        this.message = Objects.requireNonNull(message, "Message must not be null");
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public static Notification create(UUID id, UUID userId, NotificationType type, String title, String message) {
        return new Notification(id, userId, type, title, message);
    }

    public static Notification reconstitute(UUID id, UUID userId, NotificationType type,
                                            String title, String message, boolean isRead,
                                            LocalDateTime createdAt) {
        Notification notification = new Notification(id, userId, type, title, message);
        notification.isRead = isRead;
        return notification;
    }

    // --- Actions ---

    public void markAsRead() {
        this.isRead = true;
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
