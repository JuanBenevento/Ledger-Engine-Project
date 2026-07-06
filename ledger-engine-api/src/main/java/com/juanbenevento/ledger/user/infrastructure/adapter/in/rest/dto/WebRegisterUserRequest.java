package com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record WebRegisterUserRequest(
        @Schema(example = "juan@test.com", description = "Valid email address")
        @NotBlank @Email
        String emailAddress,

        @Schema(example = "+573001234567", description = "Phone in E.164 format")
        @NotBlank @Pattern(regexp = "^\\+[1-9]\\d{6,14}$")
        String phoneNumber,

        @Schema(example = "Juan", description = "User first name")
        @NotBlank
        String firstName,

        @Schema(example = "Benevento", description = "User last name")
        @NotBlank
        String lastName
) {
}
