package com.juanbenevento.ledger.qr.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.qr.application.dto.GenerateQrResponse;
import com.juanbenevento.ledger.qr.application.dto.PayQrResponse;
import com.juanbenevento.ledger.qr.application.port.input.GenerateQrUseCase;
import com.juanbenevento.ledger.qr.application.port.input.PayQrUseCase;
import com.juanbenevento.ledger.qr.infrastructure.adapter.in.rest.dto.WebGenerateQrRequest;
import com.juanbenevento.ledger.qr.infrastructure.adapter.in.rest.dto.WebPayQrRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
@Tag(name = "QR Codes", description = "QR code generation and payment endpoints")
public class QrController {

    private final GenerateQrUseCase generateQrUseCase;
    private final PayQrUseCase payQrUseCase;

    @Operation(
            summary = "Generate a QR code",
            description = "Creates a new QR code for payment collection. FIXED QR codes require the payer to enter the amount; DYNAMIC QR codes have the amount embedded.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "QR code generated successfully",
                            content = @Content(schema = @Schema(implementation = GenerateQrResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data")
            }
    )
    @PostMapping("/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody WebGenerateQrRequest request) {
        var applicationRequest = new com.juanbenevento.ledger.qr.application.dto.GenerateQrRequest(
                request.walletId(),
                request.userId(),
                request.type(),
                request.amount(),
                request.currency(),
                request.description(),
                request.ttlSeconds()
        );

        GenerateQrResponse response = generateQrUseCase.execute(applicationRequest);

        // Return JSON with base64-encoded QR image
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "qrCodeId", response.qrCodeId(),
                        "type", response.type(),
                        "amount", response.amount(),
                        "currency", response.currency(),
                        "description", response.description(),
                        "createdAt", response.createdAt(),
                        "expiresAt", response.expiresAt(),
                        "hmacPayload", response.hmacPayload(),
                        "qrImageBase64", java.util.Base64.getEncoder().encodeToString(response.qrImagePng())
                ));
    }

    @Operation(
            summary = "Pay a QR code",
            description = "Executes a payment against a QR code. Single-use: QR becomes invalid after payment. Supports both FIXED (amount in request) and DYNAMIC (amount in QR) types.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Payment successful",
                            content = @Content(schema = @Schema(implementation = PayQrResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid QR code, expired, or insufficient funds"),
                    @ApiResponse(responseCode = "409", description = "QR code already used")
            }
    )
    @PostMapping("/pay")
    public ResponseEntity<PayQrResponse> pay(@Valid @RequestBody WebPayQrRequest request) {
        var applicationRequest = new com.juanbenevento.ledger.qr.application.dto.PayQrRequest(
                request.qrCodeId(),
                request.payerWalletId(),
                request.payerUserId(),
                request.amount(),
                request.hmacPayload()
        );

        PayQrResponse response = payQrUseCase.execute(applicationRequest);
        return ResponseEntity.ok(response);
    }
}
