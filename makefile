.PHONY: build up test stop clean

build:
	docker-compose build

up:
	docker-compose up -d

test:
	docker-compose down
	$(MAKE) clean
	$(MAKE) build
	docker-compose up -d backend db
	docker-compose up test-frontend
	docker-compose down

stop:
	docker-compose stop

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f
