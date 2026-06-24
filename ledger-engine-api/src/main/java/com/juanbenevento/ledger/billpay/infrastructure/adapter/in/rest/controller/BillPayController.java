package com.juanbenevento.ledger.billpay.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.billpay.application.dto.BillPaymentResponse;
import com.juanbenevento.ledger.billpay.application.port.input.PayBillUseCase;
import com.juanbenevento.ledger.billpay.domain.model.Biller;
import com.juanbenevento.ledger.billpay.domain.port.BillerRepository;
import com.juanbenevento.ledger.billpay.infrastructure.adapter.in.rest.dto.WebPayBillRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
@Tag(name = "Bill Payments", description = "Bill payment and biller endpoints")
public class BillPayController {

    private final PayBillUseCase payBillUseCase;
    private final BillerRepository billerRepository;

    @Operation(
            summary = "Pay a bill",
            description = "Pays a bill to a registered biller. Funds are debited from the sender's wallet " +
                    "and transferred to the biller's system account.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Bill payment completed successfully",
                            content = @Content(schema = @Schema(implementation = BillPaymentResponse.class))
                    ),
                    @ApiResponse(responseCode = "400", description = "Invalid input data or biller not found"),
                    @ApiResponse(responseCode = "422", description = "Insufficient funds")
            }
    )
    @PostMapping("/pay")
    public ResponseEntity<BillPaymentResponse> payBill(
            @Valid @RequestBody WebPayBillRequest request) {

        String correlationId = request.correlationId() != null
                ? request.correlationId()
                : "BILL-" + UUID.randomUUID();

        var command = new PayBillUseCase.PayBillCommand(
                request.walletId(),
                request.userId(),
                request.billerId(),
                request.amount(),
                request.currency(),
                request.reference(),
                correlationId
        );

        BillPaymentResponse response = payBillUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Get favorite billers",
            description = "Returns all active billers that the user can pay bills to.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of active billers",
                            content = @Content(schema = @Schema(implementation = Biller.class))
                    )
            }
    )
    @GetMapping("/favorites")
    public ResponseEntity<List<Biller>> getFavoriteBillers() {
        List<Biller> billers = billerRepository.findAllActive();
        return ResponseEntity.ok(billers);
    }
}
