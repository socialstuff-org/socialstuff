

dev-up: base-image
	docker-compose --project-directory docker/dev up -d --build

dev-down:
	docker-compose --project-directory docker/dev down

dev-stop:
	docker-compose --project-directory docker/dev stop

base-image:
	docker build . -t socialstuff-identity:dev