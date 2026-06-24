package com.juanbenevento.ledger.user.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.user.domain.model.User;
import com.juanbenevento.ledger.user.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
class UserPersistenceAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;
    private final UserPersistenceMapper mapper;

    @Override
    public void save(User user) {
        UserEntity entity = mapper.toEntity(user);
        jpaRepository.save(entity);
    }

    @Override
    public void update(User user) {
        UserEntity existing = jpaRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + user.getId()));

        UserEntity entity = mapper.toEntity(user);
        // Preserve creation metadata and mark as existing
        UserEntity updatedEntity = UserEntity.builder()
                .id(entity.getId())
                .emailEncrypted(entity.getEmailEncrypted())
                .phoneEncrypted(entity.getPhoneEncrypted())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .status(entity.getStatus())
                .version(user.getVersion())
                .createdAt(existing.getCreatedAt())
                .updatedAt(existing.getUpdatedAt())
                .isNew(false)
                .build();

        jpaRepository.save(updatedEntity);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String encryptedEmail) {
        return jpaRepository.existsByEmailEncrypted(encryptedEmail);
    }

    @Override
    public boolean existsByPhone(String encryptedPhone) {
        return jpaRepository.existsByPhoneEncrypted(encryptedPhone);
    }
}
