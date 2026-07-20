package com.juanbenevento.ledger.common.config;

import com.juanbenevento.ledger.security.config.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EncryptionConfig {

    @Bean
    public String encryptionKey(SecurityProperties securityProperties) {
        return securityProperties.getEncryptionKey();
    }
}
