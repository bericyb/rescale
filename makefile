.PHONY: build up test stop clean test-setup

build:
	docker-compose build

up:
	docker-compose up -d

test-setup:
	docker-compose down
	docker-compose build
	docker-compose up -d
	sleep 15

test: test-setup
	docker-compose exec frontend npm run test:e2e
	docker-compose down

stop:
	docker-compose stop

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f
