package com.juanbenevento.ledger.user.application.dto;

import java.util.UUID;

public record RegisterUserResponse(
        UUID id,
        String emailAddress,
        String phoneNumber,
        String firstName,
        String lastName,
        String status
) {
}
