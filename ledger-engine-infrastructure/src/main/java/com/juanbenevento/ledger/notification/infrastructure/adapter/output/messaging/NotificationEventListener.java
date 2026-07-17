package com.juanbenevento.ledger.notification.infrastructure.adapter.output.messaging;

import com.juanbenevento.ledger.billpay.domain.event.BillPaymentCompletedEvent;
import com.juanbenevento.ledger.p2p.domain.event.P2pTransferCompletedEvent;
import com.juanbenevento.ledger.notification.application.port.input.NotificationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listens to domain events and creates notifications.
 * In production, this would consume from RabbitMQ; here we use Spring's EventListener
 * for simplicity and testability.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationUseCase notificationUseCase;
    private final NotificationPushService pushService;

    @EventListener
    public void handleP2pTransferCompleted(P2pTransferCompletedEvent event) {
        log.info("P2P transfer completed, creating notification: transferId={}", event.transferId());

        var command = new NotificationUseCase.CreateNotificationCommand(
                event.recipientWalletId(), // In production, map walletId → userId
                "P2P_RECEIVED",
                "Payment Received",
                String.format("You received %s %s from a P2P transfer", event.amount(), event.currency())
        );

        notificationUseCase.createNotification(command);
    }

    @EventListener
    public void handleBillPaymentCompleted(BillPaymentCompletedEvent event) {
        log.info("Bill payment completed, creating notification: paymentId={}", event.paymentId());

        var command = new NotificationUseCase.CreateNotificationCommand(
                event.walletId(), // In production, map walletId → userId
                "BILL_PAID",
                "Bill Paid",
                String.format("Bill payment of %s %s completed. Reference: %s",
                        event.amount(), event.currency(), event.reference())
        );

        notificationUseCase.createNotification(command);
    }
}
