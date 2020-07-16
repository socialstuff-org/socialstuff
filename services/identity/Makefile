

up: base-image
	cd docker/dev && docker-compose up -d --build

down:
	cd docker/dev && docker-compose down

stop:
	cd docker/dev && docker-compose stop

prod: base-image
	docker-compose --project-directory docker/prod build

base-image:
	docker build . -t socialstuff-identity:base
