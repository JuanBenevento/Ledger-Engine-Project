package com.juanbenevento.ledger.p2p.domain.port;

import com.juanbenevento.ledger.p2p.domain.model.P2pTransfer;

import java.util.Optional;
import java.util.UUID;

/**
 * Output port for P2P transfer persistence.
 * Implemented by the infrastructure adapter.
 */
public interface P2pTransferRepository {
    void save(P2pTransfer transfer);
    void update(P2pTransfer transfer);
    Optional<P2pTransfer> findById(UUID id);
    Optional<P2pTransfer> findByCorrelationId(String correlationId);
}
