---
sidebar_position: 2
title: Self-host with Docker Compose
sidebar_label: Docker Compose
description: Install MFE Orchestrator Hub with Docker Compose, bringing up MongoDB, Redis and the application together from the official image on Docker Hub.
keywords: [docker compose, self-hosting, installation, mongodb, redis]
---

# Self-host with Docker Compose

This page provides instructions to install MFE Orchestrator Hub using Docker Compose.

You can find the official docker repo on [dockerhub](https://hub.docker.com/r/lory1990/mfe-orchestrator-hub)

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- [Docker](https://docs.docker.com/get-started/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

## Start the configuration container

1. Download the follwoing [docker-compose.yaml](https://github.com/mfe-orchestrator/mfe-orchestrator/blob/main/docker-compose.yaml) file or create a `docker-compose.yaml` file with the following content:

```yaml
services:
  mongodb:
    image: mongo:8.0
    container_name: mongodb
    restart: always
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
      MONGO_INITDB_DATABASE: microfrontend-orchestrator
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "'db.runCommand({ ping: 1 })'"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    container_name: redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  mfe-orchestrator:
    image: lory1990/mfe-orchestrator:3.1.0
    container_name: mfe-orchestrator
    restart: always
    ports:
      - '8080:80'
    environment:
      NOSQL_DATABASE_URL: mongodb://root:example@mongodb:27017
      REDIS_URL: redis://redis:6379
      MICROFRONTEND_HOST_FOLDER: /upload-microfrontends
      # Once a day this installation sends an anonymous ping with aggregate
      # counters only (version, number of projects/microfrontends/environments/
      # users, deployments of the last week). No names, no URLs, no personal
      # data. Uncomment the line below to turn it off.
      # TELEMETRY_DISABLED: "true"
    volumes:
      - upload_microfrontends:/upload-microfrontends
    depends_on:
      - mongodb
      - redis

volumes:
  mongodb_data:
  redis_data:
  upload_microfrontends:
```

2. Run the following command to start the container:
```bash
docker compose up -d
```

3.  Open `http://localhost:8080` and wait for the server to come up. This can take up to 2 minutes. Once the server is up and running, you can access MFE Orchestrator at `http://localhost:8080`.

4. Once the page loads you can enter your `email`, `password` and first project name to start using the Hub

## Before you call it production

- **Pin the version.** The file above names `lory1990/mfe-orchestrator:3.1.0` on purpose: the
  `latest` tag is rebuilt from the development branches on every push, so it is not a release
  channel. Bump the tag deliberately, when you decide to upgrade. The same goes for `mongo:8.0` and
  `redis:8-alpine`.
- **Set your own `JWT_SECRET`.** Without it the tokens are signed with the built-in default.
- **Change the MongoDB credentials.** `root` / `example` is a getting-started convenience, and the
  database port is published on the host in this file.
- **Consider a replica set.** MongoDB offers transactions only on a replica set; on the standalone
  `mongod` above the backend detects it and runs the multi-document operations — creating a
  deployment among them — without one.
- **Keep the volumes.** `upload_microfrontends` holds the uploaded bundles: losing it means the
  builds served from the internal storage are gone.

Every variable you can set is listed on the
[Environment variables](./environment-variables.md) page.


