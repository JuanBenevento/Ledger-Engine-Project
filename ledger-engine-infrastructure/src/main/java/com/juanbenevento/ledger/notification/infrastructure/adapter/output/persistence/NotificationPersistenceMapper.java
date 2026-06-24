package com.juanbenevento.ledger.notification.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.notification.domain.model.Notification;
import com.juanbenevento.ledger.notification.domain.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
class NotificationPersistenceMapper {

    NotificationEntity toEntity(Notification domain) {
        return NotificationEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .type(domain.getType().name())
                .title(domain.getTitle())
                .message(domain.getMessage())
                .isRead(domain.isRead())
                .createdAt(domain.getCreatedAt())
                .build();
    }

    Notification toDomain(NotificationEntity entity) {
        return Notification.reconstitute(
                entity.getId(),
                entity.getUserId(),
                NotificationType.valueOf(entity.getType()),
                entity.getTitle(),
                entity.getMessage(),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }
}
