COMPOSE_DEV_COMMAND=docker-compose -f ./docker-compose.yml

up: base-image
	$(COMPOSE_DEV_COMMAND) up --build -d

down:
	$(COMPOSE_DEV_COMMAND) down

stop:
	$(COMPOSE_DEV_COMMAND) stop

kill:
	$(COMPOSE_DEV_COMMAND) kill -s SIGINT

# login-web:
# 	docker exec -ti socialstuff_identity_web_dev /bin/bash

# login-db:
# 	docker exec -ti socialstuff_identity_mysql_dev mysql -u root -proot --database=socialstuff_identity_dev

# prod: base-image
# 	npx loin i
# 	docker build -t socialstuff-identity:prod -f docker/prod/Dockerfile .

base-image:
	docker build services/base-image -t socialstuff-node:base

deploy:
	make -C services/identity prod
	docker-compose --project-directory . -f deployment/docker-compose.yml