

nop:
	:

deploy:
	make -C services/identity prod
	docker-compose --project-directory . -f deployment/docker-compose.yml