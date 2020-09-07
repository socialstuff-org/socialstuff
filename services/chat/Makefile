COMPASE_DEV_COMMAND=docker-compose -f docker/dev/docker-compose.yml

up: base-image
	$(COMPASE_DEV_COMMAND) up --build -d

down:
	$(COMPASE_DEV_COMMAND) down --remove-orphans

stop:
	$(COMPASE_DEV_COMMAND) stop

login-web:
	docker exec -ti socialstuff_identity_web_dev /bin/bash

login-db:
	docker exec -ti socialstuff_identity_mysql_dev mysql -u root -proot --database=socialstuff_identity_dev

prod: base-image
	docker build -t socialstuff-identity:prod -f docker/prod/Dockerfile .

base-image:
	docker build . -t socialstuff-identity:base
