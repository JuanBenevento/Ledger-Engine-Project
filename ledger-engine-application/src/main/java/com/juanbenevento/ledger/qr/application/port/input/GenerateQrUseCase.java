package com.juanbenevento.ledger.qr.application.port.input;

import com.juanbenevento.ledger.qr.application.dto.GenerateQrRequest;
import com.juanbenevento.ledger.qr.application.dto.GenerateQrResponse;

public interface GenerateQrUseCase {
    GenerateQrResponse execute(GenerateQrRequest request);
}
