FROM nginx:1
RUN apt update
RUN apt install -y iproute2
COPY nginx.conf /etc/nginx/conf.d/proxy.conf
COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]