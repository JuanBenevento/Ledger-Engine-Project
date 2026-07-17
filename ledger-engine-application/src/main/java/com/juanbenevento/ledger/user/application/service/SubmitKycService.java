package com.juanbenevento.ledger.user.application.service;

import com.juanbenevento.ledger.user.application.dto.KycStatusResponse;
import com.juanbenevento.ledger.user.application.port.input.SubmitKycUseCase;
import com.juanbenevento.ledger.user.domain.model.User;
import com.juanbenevento.ledger.user.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmitKycService implements SubmitKycUseCase {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public KycStatusResponse execute(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.submitKyc();

        userRepository.update(user);

        return new KycStatusResponse(user.getStatus().name());
    }
}
