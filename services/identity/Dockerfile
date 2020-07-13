FROM debian:10-slim
EXPOSE 3000
RUN apt update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt update
RUN apt install -y nodejs
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm i
CMD ["sh", "startup.sh"]