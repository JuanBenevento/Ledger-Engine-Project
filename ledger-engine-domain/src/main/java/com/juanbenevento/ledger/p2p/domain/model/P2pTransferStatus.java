package com.juanbenevento.ledger.p2p.domain.model;

/**
 * Status lifecycle for a P2P transfer.
 */
public enum P2pTransferStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}
