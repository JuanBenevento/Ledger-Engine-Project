package com.juanbenevento.ledger.notification.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.notification.domain.model.Notification;
import com.juanbenevento.ledger.notification.domain.port.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
class NotificationPersistenceAdapter implements NotificationRepository {

    private final NotificationJpaRepository jpaRepository;
    private final NotificationPersistenceMapper mapper;

    @Override
    public void save(Notification notification) {
        NotificationEntity entity = mapper.toEntity(notification);
        jpaRepository.save(entity);
    }

    @Override
    public void update(Notification notification) {
        NotificationEntity existing = jpaRepository.findById(notification.getId())
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notification.getId()));

        NotificationEntity entity = mapper.toEntity(notification);
        entity.setVersion(existing.getVersion());
        entity.setCreatedAt(existing.getCreatedAt());

        jpaRepository.save(entity);
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Notification> findByUserId(UUID userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public long countUnreadByUserId(UUID userId) {
        return jpaRepository.countByUserIdAndIsReadFalse(userId);
    }
}
