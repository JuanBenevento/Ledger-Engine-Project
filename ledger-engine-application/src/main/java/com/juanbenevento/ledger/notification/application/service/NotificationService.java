package com.juanbenevento.ledger.notification.application.service;

import com.juanbenevento.ledger.notification.application.dto.NotificationResponse;
import com.juanbenevento.ledger.notification.application.port.input.NotificationUseCase;
import com.juanbenevento.ledger.notification.domain.model.Notification;
import com.juanbenevento.ledger.notification.domain.model.NotificationType;
import com.juanbenevento.ledger.notification.domain.port.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService implements NotificationUseCase {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationCommand command) {
        log.info("Creating notification: userId={}, type={}, title={}", command.userId(), command.type(), command.title());

        NotificationType type = NotificationType.valueOf(command.type());

        Notification notification = Notification.create(
                UUID.randomUUID(),
                command.userId(),
                type,
                command.title(),
                command.message()
        );

        notificationRepository.save(notification);

        return toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getInbox(UUID userId) {
        log.debug("Fetching inbox for userId={}", userId);
        return notificationRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID userId) {
        log.info("Marking notification as read: notificationId={}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to user: " + userId);
        }

        notification.markAsRead();
        notificationRepository.update(notification);

        return toResponse(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
