package com.juanbenevento.ledger.security.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final SecurityProperties securityProperties;
    private final boolean oauth2Enabled;

    public SecurityConfig(SecurityProperties securityProperties,
                          @Value("${ledger.security.oauth2.enabled:true}") boolean oauth2Enabled) {
        this.securityProperties = securityProperties;
        this.oauth2Enabled = oauth2Enabled;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // Public endpoints — allow all actuator health sub-paths (liveness, readiness, etc.)
                .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                // Swagger / API docs
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**", "/api-docs").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            );

        // OAuth2 Resource Server — disabled in local profile to allow Swagger UI access
        // In local dev, the BearerTokenAuthenticationFilter intercepts ALL requests before
        // permitAll() rules apply, causing 401 on Swagger even though it's configured as public.
        // This is a known Spring Security 7.x behavior with OAuth2 Resource Server.
        if (oauth2Enabled) {
            http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        }
        // When oauth2Enabled=false (local profile), BearerTokenAuthenticationFilter is NOT
        // registered, so permitAll() rules work correctly for Swagger UI and other public paths.
        // anyRequest().authenticated() still applies for non-permitted paths.

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        String issuerUri = securityProperties.getJwt().getIssuerUri();
        return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
    }
}