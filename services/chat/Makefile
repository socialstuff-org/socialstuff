COMPOSE_DEV_COMMAND=docker-compose -f docker/dev/docker-compose.yml
COMPOSE_DEV_COMMAND_IDENTITY=docker-compose -f ../identity/docker/dev/docker-compose.yml

up: base-image
	$(COMPOSE_DEV_COMMAND_IDENTITY) up --build -d
	$(COMPOSE_DEV_COMMAND) up --build -d
	docker network connect dev_socialstuff_chat_network_dev socialstuff_identity_web_dev

down:
	$(COMPOSE_DEV_COMMAND) down

stop:
	$(COMPOSE_DEV_COMMAND) stop

login-web:
	docker exec -ti socialstuff_chat_web_dev /bin/bash

#login-db:
#	docker exec -ti socialstuff_identity_mysql_dev mysql -u root -proot --database=socialstuff_identity_dev

prod: base-image
	docker build -t socialstuff-chat:prod -f docker/prod/Dockerfile .

base-image:
	docker build ../base-image -t socialstuff-node:base
