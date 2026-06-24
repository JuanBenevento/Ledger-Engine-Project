package com.juanbenevento.ledger.notification.domain.port;

import com.juanbenevento.ledger.notification.domain.model.Notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Output port for notification persistence.
 * Implemented by the infrastructure adapter.
 */
public interface NotificationRepository {
    void save(Notification notification);
    void update(Notification notification);
    Optional<Notification> findById(UUID id);
    List<Notification> findByUserId(UUID userId);
    long countUnreadByUserId(UUID userId);
}
