package com.juanbenevento.ledger.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
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
                        .title("Ledger Engine Core API")
                        .description("High-performance accounting engine for real-time account and transaction management. " +
                                "Built with Hexagonal Architecture, DDD principles, and 4-decimal financial precision.")
                        .version("v0.1.0")
                        .contact(new Contact()
                                .name("Juan Manuel Benevento")
                                .url("https://github.com/JuanBenevento")
                                .email("juanmanuelbenevento@gmail.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .tags(List.of(
                        new Tag().name("Accounts").description("Account provisioning and lifecycle management"),
                        new Tag().name("Transactions").description("Double-entry book-keeping operations (Incoming)")
                ));
    }
}
