package com.juanbenevento.ledger.qr.application.service;

import com.juanbenevento.ledger.qr.application.dto.GenerateQrRequest;
import com.juanbenevento.ledger.qr.application.dto.GenerateQrResponse;
import com.juanbenevento.ledger.qr.application.port.input.GenerateQrUseCase;
import com.juanbenevento.ledger.qr.domain.model.QrCode;
import com.juanbenevento.ledger.qr.domain.model.QrType;
import com.juanbenevento.ledger.qr.domain.port.QrCodeGenerator;
import com.juanbenevento.ledger.qr.domain.port.QrCodeRepository;
import com.juanbenevento.ledger.qr.domain.port.QrPayloadSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GenerateQrService implements GenerateQrUseCase {

    private static final int QR_IMAGE_SIZE = 300;
    private static final int DEFAULT_TTL_SECONDS = 3600; // 1 hour

    private final QrCodeRepository qrCodeRepository;
    private final QrPayloadSigner qrPayloadSigner;
    private final QrCodeGenerator qrCodeGenerator;

    @Override
    @Transactional
    public GenerateQrResponse execute(GenerateQrRequest request) {
        QrType type = parseQrType(request.type());
        int ttlSeconds = request.ttlSeconds() > 0 ? request.ttlSeconds() : DEFAULT_TTL_SECONDS;

        // Build the payload to sign
        String payload = buildPayload(request, type);

        // Sign the payload
        String hmacSignature = qrPayloadSigner.sign(payload);

        // Create the QR Code aggregate
        QrCode qrCode = QrCode.create(
                UUID.randomUUID(),
                request.walletId(),
                request.userId(),
                type,
                request.amount(),
                request.currency(),
                request.description(),
                hmacSignature,
                ttlSeconds
        );

        qrCodeRepository.save(qrCode);

        // Generate QR image with the signed payload
        String qrContent = buildQrContent(qrCode);
        byte[] qrImage = qrCodeGenerator.generatePng(qrContent, QR_IMAGE_SIZE, QR_IMAGE_SIZE);

        return new GenerateQrResponse(
                qrCode.getId(),
                qrCode.getType().name(),
                qrCode.getAmount(),
                qrCode.getCurrency(),
                qrCode.getDescription(),
                qrCode.getCreatedAt(),
                qrCode.getExpiresAt(),
                qrCode.getHmacPayload(),
                qrImage
        );
    }

    private QrType parseQrType(String type) {
        try {
            return QrType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid QR type: " + type + ". Expected FIXED or DYNAMIC.");
        }
    }

    private String buildPayload(GenerateQrRequest request, QrType type) {
        StringBuilder sb = new StringBuilder();
        sb.append("walletId=").append(request.walletId());
        sb.append("&userId=").append(request.userId());
        sb.append("&type=").append(type.name());
        if (type == QrType.DYNAMIC && request.amount() != null) {
            sb.append("&amount=").append(request.amount());
        }
        sb.append("&currency=").append(request.currency());
        return sb.toString();
    }

    private String buildQrContent(QrCode qrCode) {
        return qrCode.getHmacPayload();
    }
}
