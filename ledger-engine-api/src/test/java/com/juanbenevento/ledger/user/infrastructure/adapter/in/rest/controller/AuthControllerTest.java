package com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.user.application.dto.RegisterUserResponse;
import com.juanbenevento.ledger.user.application.port.input.RegisterUserUseCase;
import com.juanbenevento.ledger.user.infrastructure.adapter.in.rest.dto.WebRegisterUserRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegisterUserUseCase registerUserUseCase;

    @Test
    @DisplayName("US-07: POST /api/v1/auth/register should return 201 with user data")
    void shouldRegisterUser() throws Exception {
        RegisterUserResponse response = new RegisterUserResponse(
                UUID.randomUUID(),
                "user@test.com",
                "+573001234567",
                "Juan",
                "Benevento",
                "PENDING_KYC"
        );

        when(registerUserUseCase.execute(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "emailAddress": "user@test.com",
                                    "phoneNumber": "+573001234567",
                                    "firstName": "Juan",
                                    "lastName": "Benevento"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Juan"))
                .andExpect(jsonPath("$.lastName").value("Benevento"))
                .andExpect(jsonPath("$.status").value("PENDING_KYC"));
    }

    @Test
    @DisplayName("US-07: POST /api/v1/auth/register should return 400 for invalid email")
    void shouldRejectInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "emailAddress": "not-an-email",
                                    "phoneNumber": "+573001234567",
                                    "firstName": "Juan",
                                    "lastName": "Benevento"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("US-07: POST /api/v1/auth/register should return 400 for missing fields")
    void shouldRejectMissingFields() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "emailAddress": "user@test.com"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
