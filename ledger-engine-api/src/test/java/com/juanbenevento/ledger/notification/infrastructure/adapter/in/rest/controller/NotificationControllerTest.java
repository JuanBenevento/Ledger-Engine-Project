package com.juanbenevento.ledger.notification.infrastructure.adapter.in.rest.controller;

import com.juanbenevento.ledger.notification.application.dto.NotificationResponse;
import com.juanbenevento.ledger.notification.application.port.input.NotificationUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationUseCase notificationUseCase;

    @Test
    @DisplayName("US-20: GET /api/v1/notifications should return 200 with inbox")
    void shouldGetInbox() throws Exception {
        UUID userId = UUID.randomUUID();

        List<NotificationResponse> notifications = List.of(
                new NotificationResponse(UUID.randomUUID(), userId, "TOPUP_COMPLETED",
                        "Top-up Complete", "message1", false, LocalDateTime.now()),
                new NotificationResponse(UUID.randomUUID(), userId, "P2P_RECEIVED",
                        "Payment Received", "message2", true, LocalDateTime.now())
        );

        given(notificationUseCase.getInbox(userId)).willReturn(notifications);

        mockMvc.perform(get("/api/v1/notifications")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("TOPUP_COMPLETED"))
                .andExpect(jsonPath("$[1].type").value("P2P_RECEIVED"))
                .andExpect(jsonPath("$[1].is_read").value(true));
    }

    @Test
    @DisplayName("US-20: PUT /api/v1/notifications/{id}/read should return 200")
    void shouldMarkAsRead() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        NotificationResponse response = new NotificationResponse(notificationId, userId,
                "BILL_PAID", "Bill Paid", "message", true, LocalDateTime.now());

        given(notificationUseCase.markAsRead(notificationId, userId)).willReturn(response);

        mockMvc.perform(put("/api/v1/notifications/" + notificationId + "/read")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notification_id").value(notificationId.toString()))
                .andExpect(jsonPath("$.is_read").value(true));
    }

    @Test
    @DisplayName("US-20: GET /api/v1/notifications should return empty inbox for user with no notifications")
    void shouldReturnEmptyInbox() throws Exception {
        UUID userId = UUID.randomUUID();

        given(notificationUseCase.getInbox(userId)).willReturn(List.of());

        mockMvc.perform(get("/api/v1/notifications")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
