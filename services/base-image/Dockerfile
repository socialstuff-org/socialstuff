FROM debian:10-slim
EXPOSE 3000
RUN apt update
RUN apt install -y curl git
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt update
RUN apt install -y nodejs sendmail
