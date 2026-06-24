package com.juanbenevento.ledger.qr.domain.port;

import com.juanbenevento.ledger.qr.domain.model.QrCode;

import java.util.Optional;
import java.util.UUID;

/**
 * Output port for QR Code persistence.
 * Implemented by the infrastructure adapter.
 */
public interface QrCodeRepository {
    void save(QrCode qrCode);
    void update(QrCode qrCode);
    Optional<QrCode> findById(UUID id);
    Optional<QrCode> findByHmacPayload(String hmacPayload);
}
