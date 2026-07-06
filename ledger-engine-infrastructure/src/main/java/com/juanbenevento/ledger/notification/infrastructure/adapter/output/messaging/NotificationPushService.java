package com.juanbenevento.ledger.notification.infrastructure.adapter.output.messaging;

import com.juanbenevento.ledger.notification.application.dto.NotificationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages WebSocket connections and pushes notifications to connected clients.
 * In production, this would use Spring WebSocket with STOMP or a dedicated WebSocket broker.
 */
@Slf4j
@Service
public class NotificationPushService {

    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();

    /**
     * Register a user session for push notifications.
     */
    public void registerSession(String userId, String sessionId) {
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        log.debug("Registered session {} for user {}", sessionId, userId);
    }

    /**
     * Unregister a user session.
     */
    public void unregisterSession(String userId, String sessionId) {
        Set<String> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
        }
        log.debug("Unregistered session {} for user {}", sessionId, userId);
    }

    /**
     * Push a notification to all connected sessions of a user.
     */
    public void pushToUser(String userId, NotificationResponse notification) {
        Set<String> sessions = userSessions.get(userId);
        if (sessions != null && !sessions.isEmpty()) {
            log.info("Pushing notification {} to {} session(s) for user {}",
                    notification.notificationId(), sessions.size(), userId);
            // In production: send WebSocket message to each session
            // for (String sessionId : sessions) {
            //     webSocketHandler.sendToSession(sessionId, notification);
            // }
        } else {
            log.debug("No active sessions for user {}, notification will be available in inbox", userId);
        }
    }

    /**
     * Check if a user has any active sessions.
     */
    public boolean hasActiveSessions(String userId) {
        Set<String> sessions = userSessions.get(userId);
        return sessions != null && !sessions.isEmpty();
    }
}
