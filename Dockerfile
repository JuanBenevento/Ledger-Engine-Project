# Multi-stage build for Ledger Engine

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy POM files first for better layer caching
COPY pom.xml .
COPY ledger-engine-domain/pom.xml ledger-engine-domain/
COPY ledger-engine-application/pom.xml ledger-engine-application/
COPY ledger-engine-infrastructure/pom.xml ledger-engine-infrastructure/
COPY ledger-engine-api/pom.xml ledger-engine-api/
COPY ledger-engine-security/pom.xml ledger-engine-security/
COPY ledger-engine-test/pom.xml ledger-engine-test/

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY . .

# Build application
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy built application
COPY --from=builder /app/ledger-engine-api/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Expose ports
EXPOSE 8080 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]