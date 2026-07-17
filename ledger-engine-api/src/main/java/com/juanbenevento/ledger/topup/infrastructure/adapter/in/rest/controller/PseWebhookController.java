package com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.topup.application.port.input.PseTopUpUseCase;
import com.juanbenevento.ledger.topup.infrastructure.adapter.in.rest.dto.PseWebhookCallback;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks/topup")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Payment webhook endpoints")
public class PseWebhookController {

    private final PseTopUpUseCase pseTopUpUseCase;

    @Value("${webhook.hmac.secret:default-secret-key-change-in-production}")
    private String hmacSecret;

    @Operation(
            summary = "PSE top-up webhook callback",
            description = "Receives payment confirmation from PSE gateway. Validates HMAC-SHA256 signature.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Callback processed"),
                    @ApiResponse(responseCode = "400", description = "Invalid signature or payload"),
                    @ApiResponse(responseCode = "404", description = "Top-up not found")
            }
    )
    @PostMapping("/pse")
    public ResponseEntity<Void> handlePseCallback(@Valid @RequestBody PseWebhookCallback callback) {
        log.info("Received PSE webhook: externalReference={}, success={}",
                callback.externalReference(), callback.success());

        if (!validateHmacSignature(callback)) {
            log.warn("Invalid HMAC signature for PSE webhook: externalReference={}", callback.externalReference());
            return ResponseEntity.badRequest().build();
        }

        pseTopUpUseCase.confirmCallback(
                callback.externalReference(),
                callback.success(),
                callback.failureReason()
        );

        return ResponseEntity.ok().build();
    }

    private boolean validateHmacSignature(PseWebhookCallback callback) {
        try {
            String payload = callback.externalReference() + "|" + callback.success() + "|" +
                    (callback.failureReason() != null ? callback.failureReason() : "");

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(hash);

            return expectedSignature.equalsIgnoreCase(callback.signature());
        } catch (Exception e) {
            log.error("HMAC validation error", e);
            return false;
        }
    }
}
