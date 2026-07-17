package com.juanbenevento.ledger.common.health;

import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * Custom health indicator for RabbitMQ message broker.
 */
@Component
public class RabbitMQHealthIndicator implements HealthIndicator {

    private final ConnectionFactory connectionFactory;

    public RabbitMQHealthIndicator(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public Health health() {
        try (Connection connection = connectionFactory.newConnection()) {
            if (connection.isOpen()) {
                return Health.up()
                        .withDetail("rabbitmq", "connected")
                        .withDetail("host", connectionFactory.getHost())
                        .withDetail("port", connectionFactory.getPort())
                        .build();
            }
        } catch (IOException | TimeoutException e) {
            return Health.down()
                    .withDetail("rabbitmq", "disconnected")
                    .withDetail("error", e.getMessage())
                    .build();
        }
        return Health.down()
                .withDetail("rabbitmq", "disconnected")
                .withDetail("error", "Connection closed")
                .build();
    }
}