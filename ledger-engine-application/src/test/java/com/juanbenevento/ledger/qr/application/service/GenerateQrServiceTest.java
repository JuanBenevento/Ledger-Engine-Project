package com.juanbenevento.ledger.qr.application.service;

import com.juanbenevento.ledger.qr.application.dto.GenerateQrRequest;
import com.juanbenevento.ledger.qr.application.dto.GenerateQrResponse;
import com.juanbenevento.ledger.qr.domain.model.QrCode;
import com.juanbenevento.ledger.qr.domain.port.QrCodeGenerator;
import com.juanbenevento.ledger.qr.domain.port.QrCodeRepository;
import com.juanbenevento.ledger.qr.domain.port.QrPayloadSigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenerateQrServiceTest {

    @Mock
    private QrCodeRepository qrCodeRepository;
    @Mock
    private QrPayloadSigner qrPayloadSigner;
    @Mock
    private QrCodeGenerator qrCodeGenerator;

    private GenerateQrService generateQrService;

    @BeforeEach
    void setUp() {
        generateQrService = new GenerateQrService(qrCodeRepository, qrPayloadSigner, qrCodeGenerator);
    }

    @Test
    @DisplayName("US-17: Should generate a FIXED QR code")
    void shouldGenerateFixedQrCode() {
        GenerateQrRequest request = new GenerateQrRequest(
                UUID.randomUUID(), UUID.randomUUID(), "FIXED",
                null, "COP", "Coffee payment", 3600
        );

        when(qrPayloadSigner.sign(anyString())).thenReturn("hmac-signature-123");
        when(qrCodeGenerator.generatePng(anyString(), anyInt(), anyInt())).thenReturn(new byte[]{1, 2, 3});

        GenerateQrResponse response = generateQrService.execute(request);

        assertThat(response).isNotNull();
        assertThat(response.qrCodeId()).isNotNull();
        assertThat(response.type()).isEqualTo("FIXED");
        assertThat(response.amount()).isNull();
        assertThat(response.currency()).isEqualTo("COP");
        assertThat(response.qrImagePng()).isNotEmpty();

        verify(qrCodeRepository).save(any(QrCode.class));
        verify(qrCodeGenerator).generatePng(anyString(), eq(300), eq(300));
    }

    @Test
    @DisplayName("US-17: Should generate a DYNAMIC QR code with amount")
    void shouldGenerateDynamicQrCode() {
        GenerateQrRequest request = new GenerateQrRequest(
                UUID.randomUUID(), UUID.randomUUID(), "DYNAMIC",
                new BigDecimal("50000.00"), "COP", "Service payment", 1800
        );

        when(qrPayloadSigner.sign(anyString())).thenReturn("hmac-signature-456");
        when(qrCodeGenerator.generatePng(anyString(), anyInt(), anyInt())).thenReturn(new byte[]{4, 5, 6});

        GenerateQrResponse response = generateQrService.execute(request);

        assertThat(response).isNotNull();
        assertThat(response.type()).isEqualTo("DYNAMIC");
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(response.qrImagePng()).isNotEmpty();
    }

    @Test
    @DisplayName("US-17: Should reject invalid QR type")
    void shouldRejectInvalidQrType() {
        GenerateQrRequest request = new GenerateQrRequest(
                UUID.randomUUID(), UUID.randomUUID(), "INVALID",
                null, "COP", "Test", 3600
        );

        assertThatThrownBy(() -> generateQrService.execute(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid QR type");
    }

    @Test
    @DisplayName("US-17: Should use default TTL when not provided")
    void shouldUseDefaultTtlWhenNotProvided() {
        GenerateQrRequest request = new GenerateQrRequest(
                UUID.randomUUID(), UUID.randomUUID(), "FIXED",
                null, "COP", "Test", 0
        );

        when(qrPayloadSigner.sign(anyString())).thenReturn("hmac");
        when(qrCodeGenerator.generatePng(anyString(), anyInt(), anyInt())).thenReturn(new byte[]{});

        GenerateQrResponse response = generateQrService.execute(request);

        assertThat(response).isNotNull();
        assertThat(response.expiresAt()).isAfter(response.createdAt());
    }
}
