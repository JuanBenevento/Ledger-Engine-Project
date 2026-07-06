package com.juanbenevento.ledger.notification.infrastructure.adapter.in.websocket;

import com.juanbenevento.ledger.notification.infrastructure.adapter.output.messaging.NotificationPushService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.UUID;

/**
 * WebSocket handler for real-time notification push.
 * Clients connect to /ws/notifications?userId={userId} to receive live updates.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final NotificationPushService pushService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserId(session);
        if (userId != null) {
            String sessionId = session.getId();
            pushService.registerSession(userId, sessionId);
            log.info("WebSocket connected: sessionId={}, userId={}", sessionId, userId);

            // Send welcome message
            session.sendMessage(new TextMessage("""
                    {"type": "CONNECTED", "message": "Notification channel established"}
                    """));
        } else {
            log.warn("WebSocket connection without userId, closing: sessionId={}", session.getId());
            session.close(CloseStatus.NOT_ACCEPTABLE);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = extractUserId(session);
        if (userId != null) {
            pushService.unregisterSession(userId, session.getId());
            log.info("WebSocket disconnected: sessionId={}, userId={}", session.getId(), userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Clients can send ping/pong or subscription updates
        log.debug("Received message from session {}: {}", session.getId(), message.getPayload());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
        String userId = extractUserId(session);
        if (userId != null) {
            pushService.unregisterSession(userId, session.getId());
        }
    }

    private String extractUserId(WebSocketSession session) {
        try {
            var uri = session.getUri();
            if (uri != null) {
                var params = UriComponentsBuilder.fromUri(uri).build().getQueryParams();
                var userIds = params.get("userId");
                if (userIds != null && !userIds.isEmpty()) {
                    return userIds.get(0);
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract userId from WebSocket session", e);
        }
        return null;
    }
}
