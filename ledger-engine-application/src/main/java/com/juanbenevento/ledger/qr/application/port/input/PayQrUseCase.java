package com.juanbenevento.ledger.qr.application.port.input;

import com.juanbenevento.ledger.qr.application.dto.PayQrRequest;
import com.juanbenevento.ledger.qr.application.dto.PayQrResponse;

public interface PayQrUseCase {
    PayQrResponse execute(PayQrRequest request);
}
