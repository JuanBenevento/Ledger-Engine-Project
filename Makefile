##############################################################################
# Makefile — Ledger Engine Platform
# Staging Environment Commands
##############################################################################

# Variables
COMPOSE_FILE := docker-compose.staging.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)
APP_CONTAINER := ledger-staging-app

# Colors
GREEN := \033[0;32m
YELLOW := \033[0;33m
CYAN := \033[0;36m
NC := \033[0m

.PHONY: help staging-up staging-down staging-restart staging-logs staging-ps
.PHONY: staging-build staging-health staging-status staging-shell
.PHONY: keycloak-setup keycloak-realms db-connect redis-connect
.PHONY: staging-clean staging-reset

##############################################################################
# HELP
##############################################################################

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)Ledger Engine — Staging Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

##############################################################################
# STAGING lifecycle
##############################################################################

staging-up: ## Start staging environment
	@echo "$(GREEN)Starting staging environment...$(NC)"
	$(COMPOSE) up -d
	@echo "$(GREEN)Waiting for services to be healthy...$(NC)"
	@sleep 10
	$(COMPOSE) ps
	@echo ""
	@echo "$(CYAN)Staging URLs:$(NC)"
	@echo "  App:         http://localhost:8080"
	@echo "  Swagger:     http://localhost:8080/swagger-ui.html"
	@echo "  Actuator:    http://localhost:8080/actuator/health"
	@echo "  Keycloak:    http://localhost:8180/auth"
	@echo "  Prometheus:  http://localhost:9090"
	@echo "  Grafana:     http://localhost:3000"
	@echo "  RabbitMQ:    http://localhost:15672 (guest/guest)"
	@echo ""

staging-down: ## Stop staging environment
	@echo "$(YELLOW)Stopping staging environment...$(NC)"
	$(COMPOSE) down

staging-restart: ## Restart staging environment
	@echo "$(YELLOW)Restarting staging environment...$(NC)"
	$(COMPOSE) restart

staging-rebuild: ## Rebuild and restart staging environment
	@echo "$(YELLOW)Rebuilding staging environment...$(NC)"
	$(COMPOSE) up -d --build

##############################################################################
# STAGING logs & status
##############################################################################

staging-logs: ## Tail logs from all staging services
	$(COMPOSE) logs -f

staging-logs-app: ## Tail logs from app only
	$(COMPOSE) logs -f app

staging-logs-keycloak: ## Tail logs from Keycloak only
	$(COMPOSE) logs -f keycloak

staging-ps: ## Show running staging containers
	$(COMPOSE) ps

staging-health: ## Check health of all staging services
	@echo "$(CYAN)Checking health status...$(NC)"
	@$(COMPOSE) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(CYAN)App health endpoint:$(NC)"
	@curl -s http://localhost:8080/actuator/health | head -20 || echo "$(YELLOW)App not ready yet$(NC)"

staging-status: ## Show detailed staging status
	@echo "$(CYAN)=== Docker Compose Status ===$(NC)"
	@$(COMPOSE) ps
	@echo ""
	@echo "$(CYAN)=== Docker Images ===$(NC)"
	@docker images | grep ledger-staging || echo "No staging images found"
	@echo ""
	@echo "$(CYAN)=== Docker Volumes ===$(NC)"
	@docker volume ls | grep staging || echo "No staging volumes found"

##############################################################################
# STAGING build & shell
##############################################################################

staging-build: ## Build staging Docker image
	@echo "$(GREEN)Building staging image...$(NC)"
	$(COMPOSE) build app

staging-shell: ## Open shell in app container
	$(COMPOSE) exec app /bin/sh

staging-shell-postgres: ## Open psql in postgres container
	$(COMPOSE) exec postgres psql -U postgres -d ledger_db_staging

##############################################################################
# KEYCLOAK setup
##############################################################################

keycloak-setup: ## Setup Keycloak realm and client for Ledger Engine
	@echo "$(GREEN)Setting up Keycloak realm...$(NC)"
	@echo "Waiting for Keycloak to be ready..."
	@sleep 15
	@echo "Creating realm 'ledger-engine'..."
	@$(COMPOSE) exec keycloak /opt/keycloak/bin/kcadm.sh create realms \
		--server http://localhost:8080/auth \
		--realm master \
		--user admin \
		--password admin \
		--set realm=ledger-engine \
		--set enabled=true \
		--set registrationAllowed=true || echo "$(YELLOW)Realm may already exist$(NC)"
	@echo "Creating client 'ledger-engine-api'..."
	@$(COMPOSE) exec keycloak /opt/keycloak/bin/kcadm.sh create clients \
		--server http://localhost:8080/auth \
		--realm ledger-engine \
		--user admin \
		--password admin \
		--set clientId=ledger-engine-api \
		--set publicClient=true \
		--set directAccessGrantsEnabled=true \
		--set enabled=true || echo "$(YELLOW)Client may already exist$(NC)"
	@echo "$(GREEN)Keycloak setup complete!$(NC)"
	@echo "  Admin Console: http://localhost:8180/auth/admin"
	@echo "  Realm: ledger-engine"
	@echo "  Client: ledger-engine-api"

keycloak-realms: ## List Keycloak realms
	$(COMPOSE) exec keycloak /opt/keycloak/bin/kcadm.sh get realms \
		--server http://localhost:8080/auth \
		--realm master \
		--user admin \
		--password admin

##############################################################################
# DATABASE utilities
##############################################################################

db-connect: ## Connect to PostgreSQL (staging)
	$(COMPOSE) exec postgres psql -U postgres -d ledger_db_staging

db-migrate: ## Run Flyway migrations (app restart triggers this)
	@echo "$(GREEN)Restarting app to trigger Flyway migrations...$(NC)"
	$(COMPOSE) restart app

redis-connect: ## Connect to Redis CLI (staging)
	$(COMPOSE) exec redis redis-cli

##############################################################################
# CLEAN & RESET
##############################################################################

staging-clean: ## Stop staging and remove volumes
	@echo "$(YELLOW)Stopping and removing staging volumes...$(NC)"
	$(COMPOSE) down -v

staging-reset: ## Full reset: stop, remove volumes, rebuild
	@echo "$(RED)Resetting staging environment...$(NC)"
	$(COMPOSE) down -v --remove-orphans
	@echo "$(GREEN)Rebuilding...$(NC)"
	$(COMPOSE) up -d --build
	@sleep 15
	@echo "$(GREEN)Running Keycloak setup...$(NC)"
	$(MAKE) keycloak-setup
	@echo "$(GREEN)Staging environment reset complete!$(NC)"

##############################################################################
# TESTING against staging
##############################################################################

test-health: ## Quick health check against staging
	@echo "$(CYAN)Checking app health...$(NC)"
	@curl -s http://localhost:8080/actuator/health | python -m json.tool 2>/dev/null || curl -s http://localhost:8080/actuator/health

test-register: ## Test user registration against staging
	@echo "$(CYAN)Testing user registration...$(NC)"
	@curl -s -X POST http://localhost:8080/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"test@staging.com","password":"Test1234!","firstName":"Test","lastName":"User"}' | python -m json.tool 2>/dev/null

test-swagger: ## Open Swagger UI in browser
	@echo "$(CYAN)Opening Swagger UI...$(NC)"
	@start http://localhost:8080/swagger-ui.html
