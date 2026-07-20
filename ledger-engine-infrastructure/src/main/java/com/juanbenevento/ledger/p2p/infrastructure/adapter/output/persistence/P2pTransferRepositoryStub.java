package com.juanbenevento.ledger.p2p.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.p2p.domain.model.P2pTransfer;
import com.juanbenevento.ledger.p2p.domain.port.P2pTransferRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * TODO: Replace with JPA adapter when P2P persistence is implemented.
 */
@Component
public class P2pTransferRepositoryStub implements P2pTransferRepository {
    @Override public void save(P2pTransfer transfer) {}
    @Override public void update(P2pTransfer transfer) {}
    @Override public Optional<P2pTransfer> findById(UUID id) { return Optional.empty(); }
    @Override public Optional<P2pTransfer> findByCorrelationId(String correlationId) { return Optional.empty(); }
}
