package com.juanbenevento.ledger.security.application.service;

import com.juanbenevento.ledger.security.application.dto.DisableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorRequest;
import com.juanbenevento.ledger.security.application.dto.EnableTwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.TwoFactorResponse;
import com.juanbenevento.ledger.security.application.dto.VerifyTwoFactorRequest;
import com.juanbenevento.ledger.security.application.port.input.DisableTwoFactorUseCase;
import com.juanbenevento.ledger.security.application.port.input.EnableTwoFactorUseCase;
import com.juanbenevento.ledger.security.application.port.input.VerifyTwoFactorUseCase;
import com.juanbenevento.ledger.security.domain.model.TwoFactorAuth;
import com.juanbenevento.ledger.security.domain.port.TwoFactorAuthRepository;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.qr.QrData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthService implements EnableTwoFactorUseCase, VerifyTwoFactorUseCase, DisableTwoFactorUseCase {

    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private static final String APP_NAME = "LedgerEngine";
    private static final String ISSUER = "Ledger Engine";

    @Override
    @Transactional
    public EnableTwoFactorResponse execute(EnableTwoFactorRequest request) {
        UUID userId = request.userId();

        // Check if 2FA is already enabled
        if (twoFactorAuthRepository.existsByUserId(userId)) {
            throw new IllegalStateException("2FA is already enabled for this user");
        }

        // Generate secret key
        String secretKey = secretGenerator.generate();

        // Create 2FA aggregate
        TwoFactorAuth twoFactorAuth = TwoFactorAuth.create(UUID.randomUUID(), userId, secretKey);

        // Generate QR code URI
        QrData qrData = new QrData.Builder()
                .label(APP_NAME + ":" + userId.toString())
                .secret(secretKey)
                .issuer(ISSUER)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        String qrCodeUri = qrData.getUri();

        // Enable 2FA and generate backup codes
        twoFactorAuth.enable();

        // Save to repository
        twoFactorAuthRepository.save(twoFactorAuth);

        return new EnableTwoFactorResponse(
                userId,
                secretKey,
                qrCodeUri,
                twoFactorAuth.getBackupCodes()
        );
    }

    @Override
    @Transactional
    public TwoFactorResponse execute(VerifyTwoFactorRequest request) {
        UUID userId = request.userId();
        String code = request.code();

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("2FA is not enabled for this user"));

        // Check if it's a backup code
        if (twoFactorAuth.getBackupCodes().contains(code)) {
            twoFactorAuth.consumeBackupCode(code);
            twoFactorAuth.recordUsage();
            twoFactorAuthRepository.update(twoFactorAuth);
            return new TwoFactorResponse(userId, true, "Backup code verified successfully");
        }

        // Verify TOTP code
        TimeProvider timeProvider = new SystemTimeProvider();
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

        if (verifier.isValidCode(twoFactorAuth.getSecretKey(), code)) {
            twoFactorAuth.recordUsage();
            twoFactorAuthRepository.update(twoFactorAuth);
            return new TwoFactorResponse(userId, true, "TOTP code verified successfully");
        }

        throw new IllegalArgumentException("Invalid 2FA code");
    }

    @Override
    @Transactional
    public TwoFactorResponse execute(DisableTwoFactorRequest request) {
        UUID userId = request.userId();

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("2FA is not enabled for this user"));

        twoFactorAuth.disable();
        twoFactorAuthRepository.update(twoFactorAuth);

        return new TwoFactorResponse(userId, false, "2FA disabled successfully");
    }
}