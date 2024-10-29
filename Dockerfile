# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md

FROM node:22.1-bookworm-slim as base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

FROM base AS deps

COPY package.json ./
COPY prisma ./

# RUN apt update && apt install -y curl sudo postgresql-client && apt clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# RUN apk add git g++ make py3-pip curl graphicsmagick ghostscript

RUN npm install

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run codegen

EXPOSE 8080

CMD [ "npm", "start" ]
