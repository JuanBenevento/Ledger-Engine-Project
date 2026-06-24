package com.juanbenevento.ledger.notification.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.notification.application.dto.NotificationResponse;
import com.juanbenevento.ledger.notification.application.port.input.NotificationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification endpoints")
public class NotificationController {

    private final NotificationUseCase notificationUseCase;

    @Operation(
            summary = "Get user notifications (inbox)",
            description = "Returns all notifications for the authenticated user, ordered by creation date descending.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of notifications",
                            content = @Content(schema = @Schema(implementation = NotificationResponse.class))
                    )
            }
    )
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getInbox(
            @RequestHeader("X-User-Id") UUID userId) {

        List<NotificationResponse> notifications = notificationUseCase.getInbox(userId);
        return ResponseEntity.ok(notifications);
    }

    @Operation(
            summary = "Mark notification as read",
            description = "Marks a specific notification as read for the authenticated user.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Notification marked as read",
                            content = @Content(schema = @Schema(implementation = NotificationResponse.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Notification not found"),
                    @ApiResponse(responseCode = "403", description = "Notification does not belong to user")
            }
    )
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {

        NotificationResponse response = notificationUseCase.markAsRead(id, userId);
        return ResponseEntity.ok(response);
    }
}
