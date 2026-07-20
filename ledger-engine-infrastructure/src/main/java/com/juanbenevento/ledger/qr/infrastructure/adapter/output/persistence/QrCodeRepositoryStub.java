package com.juanbenevento.ledger.qr.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.qr.domain.model.QrCode;
import com.juanbenevento.ledger.qr.domain.port.QrCodeRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * TODO: Replace with JPA adapter when QR Code persistence is implemented.
 */
@Component
public class QrCodeRepositoryStub implements QrCodeRepository {
    @Override public void save(QrCode qrCode) {}
    @Override public void update(QrCode qrCode) {}
    @Override public Optional<QrCode> findById(UUID id) { return Optional.empty(); }
    @Override public Optional<QrCode> findByHmacPayload(String hmacPayload) { return Optional.empty(); }
}
