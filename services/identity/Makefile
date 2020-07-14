

up: base-image
	docker-compose --project-directory docker/dev up -d --build

down:
	docker-compose --project-directory docker/dev down

stop:
	docker-compose --project-directory docker/dev stop

prod: base-image
	docker-compose --project-directory docker/prod build

base-image:
	docker build . -t socialstuff-identity:base