COMPOSE_DEV_COMMAND=docker-compose -f ./docker-compose.yml

up: base-image
	$(COMPOSE_DEV_COMMAND) up --build -d

down:
	$(COMPOSE_DEV_COMMAND) down

stop:
	$(COMPOSE_DEV_COMMAND) stop

start-identity:
	cd services/identity && npm run dev

start-chat:
	cd services/chat && npm run dev

base-image:
	docker build services/base-image -t socialstuff-node:base

deploy:
	make -C services/identity prod
	make -C services/chat prod
	docker-compose --project-directory . -f deployment/docker-compose.yml
