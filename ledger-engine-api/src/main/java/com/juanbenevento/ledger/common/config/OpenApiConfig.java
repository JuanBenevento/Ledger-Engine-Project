package com.juanbenevento.ledger.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ledgerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Ledger Engine Virtual Wallet API")
                        .description("High-performance virtual wallet platform with P2P transfers, QR payments, " +
                                "bill payments, top-ups, and real-time notifications. " +
                                "Built with Hexagonal Architecture, DDD principles, and double-entry bookkeeping.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Juan Manuel Benevento")
                                .url("https://github.com/JuanBenevento")
                                .email("juanmanuelbenevento@gmail.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local development"),
                        new Server().url("https://api.staging.ledger-engine.com").description("Staging")
                ))
                .tags(List.of(
                        new Tag().name("Accounts").description("Account provisioning and lifecycle management"),
                        new Tag().name("Account Management").description("Account freeze, activate, and close operations"),
                        new Tag().name("Transfers").description("Double-entry book-keeping transfer operations"),
                        new Tag().name("Cash Operations").description("Direct cash-in deposit operations"),
                        new Tag().name("Wallets").description("Virtual wallet management and balance queries"),
                        new Tag().name("P2P Transfers").description("Peer-to-peer money transfers between users"),
                        new Tag().name("TopUps").description("Wallet top-up via card, PSE, or cash"),
                        new Tag().name("Webhooks").description("Payment provider webhook callbacks"),
                        new Tag().name("QR Codes").description("QR code generation and payment collection"),
                        new Tag().name("Bill Payments").description("Bill payment to registered utility and service billers"),
                        new Tag().name("Notifications").description("In-app notification inbox and real-time push"),
                        new Tag().name("KYC").description("Know Your Customer verification workflow"),
                        new Tag().name("Authentication").description("User registration and JWT authentication")
                ));
    }
}
