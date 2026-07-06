package com.juanbenevento.ledger.user.infrastructure.adapter.output.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {
    boolean existsByEmailEncrypted(String emailEncrypted);
    boolean existsByPhoneEncrypted(String phoneEncrypted);
}
