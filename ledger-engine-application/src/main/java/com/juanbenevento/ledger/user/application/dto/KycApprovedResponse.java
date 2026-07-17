package com.juanbenevento.ledger.user.application.dto;

public record KycApprovedResponse(
        String status,
        WalletInfo wallet
) {
}
