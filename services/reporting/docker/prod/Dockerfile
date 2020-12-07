FROM socialstuff-node:base
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build
RUN npm prune --production
RUN rm -r src
COPY startup.sh /root/startup.sh
CMD ["sh", "/root/startup.sh"]
