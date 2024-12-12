.PHONY: up down

down:
	docker compose down -v

up:
	docker compose up --build -d
	@echo "Waiting for MongoDB to be ready..."
	@sleep 8
	@docker compose exec app node --import=tsx src/seed.ts || (docker compose logs mongodb && exit 1)
	@echo "Seeding complete"
	docker compose logs -f app

test:
	docker compose exec app npm run test