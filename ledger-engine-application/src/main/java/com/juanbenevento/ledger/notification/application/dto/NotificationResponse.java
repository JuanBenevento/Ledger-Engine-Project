package com.juanbenevento.ledger.notification.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for notification operations.
 */
public record NotificationResponse(
        @JsonProperty("notification_id")
        UUID notificationId,

        @JsonProperty("user_id")
        UUID userId,

        String type,
        String title,
        String message,

        @JsonProperty("is_read")
        boolean isRead,

        @JsonProperty("created_at")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {
}
