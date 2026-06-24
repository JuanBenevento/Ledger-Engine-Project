package com.juanbenevento.ledger.user.application.dto;

public record RegisterUserRequest(
        String emailAddress,
        String phoneNumber,
        String firstName,
        String lastName
) {
}
