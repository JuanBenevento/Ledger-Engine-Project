package com.juanbenevento.ledger.user.application.service;

import com.juanbenevento.ledger.user.application.dto.RegisterUserRequest;
import com.juanbenevento.ledger.user.application.dto.RegisterUserResponse;
import com.juanbenevento.ledger.user.application.port.input.RegisterUserUseCase;
import com.juanbenevento.ledger.user.domain.model.EmailAddress;
import com.juanbenevento.ledger.user.domain.model.PhoneNumber;
import com.juanbenevento.ledger.user.domain.model.User;
import com.juanbenevento.ledger.user.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegisterUserService implements RegisterUserUseCase {

    private final UserRepository userRepository;
    private final String encryptionKey;

    @Override
    @Transactional
    public RegisterUserResponse execute(RegisterUserRequest request) {
        EmailAddress email = EmailAddress.of(request.emailAddress(), encryptionKey);
        PhoneNumber phone = PhoneNumber.of(request.phoneNumber(), encryptionKey);

        if (userRepository.existsByEmail(email.getEncryptedValue())) {
            throw new IllegalArgumentException("Email already registered: " + request.emailAddress());
        }

        if (userRepository.existsByPhone(phone.getEncryptedValue())) {
            throw new IllegalArgumentException("Phone already registered: " + request.phoneNumber());
        }

        User user = User.create(UUID.randomUUID(), email, phone, request.firstName(), request.lastName());

        userRepository.save(user);

        return new RegisterUserResponse(
                user.getId(),
                user.getEmailAddress().getPlaintext(),
                user.getPhoneNumber().getPlaintext(),
                user.getFirstName(),
                user.getLastName(),
                user.getStatus().name()
        );
    }
}
