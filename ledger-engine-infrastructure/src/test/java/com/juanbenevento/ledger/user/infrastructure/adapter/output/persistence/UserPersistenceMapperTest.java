package com.juanbenevento.ledger.user.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.user.domain.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserPersistenceMapperTest {

    private static final String TEST_KEY = "0123456789abcdef0123456789abcdef";
    private final UserPersistenceMapper mapper = new UserPersistenceMapper(TEST_KEY);

    @Test
    @DisplayName("US-06: Should map domain User to entity")
    void shouldMapToEntity() {
        User domain = User.create(
                java.util.UUID.randomUUID(),
                EmailAddress.of("mapper@test.com", TEST_KEY),
                PhoneNumber.of("+573001234567", TEST_KEY),
                "Mapper", "Test"
        );

        UserEntity entity = mapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getId()).isEqualTo(domain.getId());
        assertThat(entity.getFirstName()).isEqualTo("Mapper");
        assertThat(entity.getLastName()).isEqualTo("Test");
        assertThat(entity.getStatus()).isEqualTo("PENDING_KYC");
        assertThat(entity.getEmailEncrypted()).isNotBlank();
        assertThat(entity.getPhoneEncrypted()).isNotBlank();
        assertThat(entity.getEmailEncrypted()).isNotEqualTo("mapper@test.com");
    }

    @Test
    @DisplayName("US-06: Should map entity back to domain with decrypted PII")
    void shouldMapToDomain() {
        UserEntity entity = UserEntity.builder()
                .id(java.util.UUID.randomUUID())
                .emailEncrypted(mapper.encrypt("domain@test.com"))
                .phoneEncrypted(mapper.encrypt("+573009876543"))
                .firstName("Domain")
                .lastName("Test")
                .status("ACTIVE")
                .version(3L)
                .build();

        User domain = mapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getId()).isEqualTo(entity.getId());
        assertThat(domain.getEmailAddress().getPlaintext()).isEqualTo("domain@test.com");
        assertThat(domain.getPhoneNumber().getPlaintext()).isEqualTo("+573009876543");
        assertThat(domain.getFirstName()).isEqualTo("Domain");
        assertThat(domain.getLastName()).isEqualTo("Test");
        assertThat(domain.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(domain.getVersion()).isEqualTo(3L);
    }

    @Test
    @DisplayName("US-06: Should roundtrip — domain → entity → domain preserves data")
    void shouldRoundtrip() {
        User original = User.create(
                java.util.UUID.randomUUID(),
                EmailAddress.of("round@test.com", TEST_KEY),
                PhoneNumber.of("+573005556666", TEST_KEY),
                "Round", "Trip"
        );

        UserEntity entity = mapper.toEntity(original);
        User restored = mapper.toDomain(entity);

        assertThat(restored.getId()).isEqualTo(original.getId());
        assertThat(restored.getEmailAddress()).isEqualTo(original.getEmailAddress());
        assertThat(restored.getPhoneNumber()).isEqualTo(original.getPhoneNumber());
        assertThat(restored.getFirstName()).isEqualTo(original.getFirstName());
        assertThat(restored.getLastName()).isEqualTo(original.getLastName());
        assertThat(restored.getStatus()).isEqualTo(original.getStatus());
    }
}
