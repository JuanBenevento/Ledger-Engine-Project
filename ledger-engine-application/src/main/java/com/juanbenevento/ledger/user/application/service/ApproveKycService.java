package com.juanbenevento.ledger.user.application.service;

import com.juanbenevento.ledger.user.application.dto.KycApprovedResponse;
import com.juanbenevento.ledger.user.application.dto.WalletInfo;
import com.juanbenevento.ledger.user.application.port.input.ApproveKycUseCase;
import com.juanbenevento.ledger.user.application.port.output.WalletCreationPort;
import com.juanbenevento.ledger.user.domain.model.User;
import com.juanbenevento.ledger.user.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApproveKycService implements ApproveKycUseCase {

    private final UserRepository userRepository;
    private final WalletCreationPort walletCreationPort;

    @Override
    @Transactional
    public KycApprovedResponse execute(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.approveKyc();
        user.activate();

        userRepository.update(user);

        String correlationId = "KYC-" + userId + "-" + System.currentTimeMillis();
        WalletInfo wallet = walletCreationPort.createPrimaryWallet(userId, correlationId);

        return new KycApprovedResponse(user.getStatus().name(), wallet);
    }
}
