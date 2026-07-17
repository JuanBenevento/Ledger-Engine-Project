package com.juanbenevento.ledger.topup.domain.model;

/**
 * Status lifecycle for a top-up operation.
 */
public enum TopUpStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    EXPIRED
}
