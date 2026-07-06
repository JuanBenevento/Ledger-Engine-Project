package com.juanbenevento.ledger.qr.domain.port;

/**
 * Output port for QR code image generation.
 * Converts payload data into a QR code image (PNG bytes).
 * Implemented by the infrastructure adapter (ZXing).
 */
public interface QrCodeGenerator {
    /**
     * Generates a QR code PNG image for the given payload.
     * @param payload the data to encode in the QR code
     * @param width   image width in pixels
     * @param height  image height in pixels
     * @return PNG image bytes
     */
    byte[] generatePng(String payload, int width, int height);
}
