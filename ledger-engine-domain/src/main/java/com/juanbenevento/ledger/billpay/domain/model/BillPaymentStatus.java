package com.juanbenevento.ledger.billpay.domain.model;

/**
 * Status lifecycle for a bill payment.
 */
public enum BillPaymentStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}
