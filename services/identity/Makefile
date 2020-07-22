
COMPASE_DEV_COMMAND=docker-compose -f docker/dev/docker-compose.yml

up: base-image
	$(COMPASE_DEV_COMMAND) up --build -d

down:
	$(COMPASE_DEV_COMMAND) down --remove-orphans

stop:
	$(COMPASE_DEV_COMMAND) stop

prod: base-image
	docker-compose --project-directory docker/prod build

base-image:
	docker build . -t socialstuff-identity:base
