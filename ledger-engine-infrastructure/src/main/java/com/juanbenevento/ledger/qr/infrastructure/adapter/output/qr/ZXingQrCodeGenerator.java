package com.juanbenevento.ledger.qr.infrastructure.adapter.output.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.juanbenevento.ledger.qr.domain.port.QrCodeGenerator;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;

/**
 * ZXing-based implementation of QrCodeGenerator port.
 * Generates QR code PNG images.
 */
@Component
public class ZXingQrCodeGenerator implements QrCodeGenerator {

    private static final QRCodeWriter QR_WRITER = new QRCodeWriter();

    @Override
    public byte[] generatePng(String payload, int width, int height) {
        try {
            Map<EncodeHintType, Object> hints = Map.of(
                    EncodeHintType.MARGIN, 1,
                    EncodeHintType.ERROR_CORRECTION, com.google.zxing.qrcode.decoder.ErrorCorrectionLevel.M
            );

            BitMatrix matrix = QR_WRITER.encode(payload, BarcodeFormat.QR_CODE, width, height, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code image", e);
        }
    }
}
