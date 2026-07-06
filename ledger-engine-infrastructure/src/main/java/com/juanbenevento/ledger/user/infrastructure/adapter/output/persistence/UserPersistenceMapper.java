package com.juanbenevento.ledger.user.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.user.domain.model.*;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Component
public class UserPersistenceMapper {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final String encryptionKey;

    public UserPersistenceMapper(String encryptionKey) {
        this.encryptionKey = encryptionKey;
    }

    public UserEntity toEntity(User domain) {
        return UserEntity.builder()
                .id(domain.getId())
                .emailEncrypted(domain.getEmailAddress().getEncryptedValue())
                .phoneEncrypted(domain.getPhoneNumber().getEncryptedValue())
                .firstName(domain.getFirstName())
                .lastName(domain.getLastName())
                .status(domain.getStatus().name())
                .version(null)
                .isNew(true)
                .build();
    }

    public User toDomain(UserEntity entity) {
        EmailAddress email = EmailAddress.reconstitute(entity.getEmailEncrypted(), encryptionKey);
        PhoneNumber phone = PhoneNumber.reconstitute(entity.getPhoneEncrypted(), encryptionKey);

        return User.reconstitute(
                entity.getId(),
                email,
                phone,
                entity.getFirstName(),
                entity.getLastName(),
                UserStatus.valueOf(entity.getStatus()),
                entity.getVersion()
        );
    }

    /**
     * Generic AES-256-GCM encryption for use in repository queries.
     */
    public String encrypt(String plaintext) {
        try {
            byte[] keyBytes = hexToBytes(encryptionKey);
            SecretKey key = new SecretKeySpec(keyBytes, "AES");

            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            return bytesToHex(buffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt value", e);
        }
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
