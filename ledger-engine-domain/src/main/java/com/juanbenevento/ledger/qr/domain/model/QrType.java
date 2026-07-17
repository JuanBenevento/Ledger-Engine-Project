package com.juanbenevento.ledger.qr.domain.model;

/**
 * QR code type.
 * FIXED: Static amount QR (user enters amount at scan time)
 * DYNAMIC: Pre-set amount QR (amount embedded in QR payload)
 */
public enum QrType {
    FIXED,
    DYNAMIC
}
