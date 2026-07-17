package com.juanbenevento.ledger.qr.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record GenerateQrResponse(
        UUID qrCodeId,
        String type,
        BigDecimal amount,
        String currency,
        String description,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        String hmacPayload,
        byte[] qrImagePng
) {
}
