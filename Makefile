.PHONY: help up down build logs ps restart clean db-migrate

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services in background
	docker compose up -d

down: ## Stop all services
	docker compose down

build: ## Build (or rebuild) all images
	docker compose build --no-cache

logs: ## Tail logs from all services
	docker compose logs -f

ps: ## Show running containers
	docker compose ps

restart: ## Restart all services
	docker compose restart

clean: ## Remove containers, volumes, and images (DESTRUCTIVE)
	docker compose down -v --rmi local

db-migrate: ## Run CMS database migrations
	docker compose exec cms-admin node -e "import('./dist/index.js')" || \
	docker compose run --rm cms-admin sh -c "pnpm db:push"

cms-logs: ## Tail CMS admin logs only
	docker compose logs -f cms-admin

umami-logs: ## Tail Umami logs only
	docker compose logs -f umami
