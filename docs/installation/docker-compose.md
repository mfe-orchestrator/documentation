---
sidebar_position: 2
---

# Docker Compose

This page provides instructions to install MFE Orchestrator Hub using Docker Compose.

You can find the official docker repo on [dockerhub](https://hub.docker.com/r/lory1990/microfrontend-orchestrator-hub)

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- [Docker](https://docs.docker.com/get-started/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

## Start the configuration container

1. Download the follwoing [docker-compose.yaml](https://github.com/lory1990/micro-frontend-orchestrator-hub/blob/main/docker-compose.yaml) file or create a `docker-compose.yaml` file with the following content:

```
services:
  mongodb:
    image: mongo:latest
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
    image: redis:alpine
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

  microfrontend-orchestrator-hub:
    image: lory1990/microfrontend-orchestrator-hub:latest
    container_name: microfrontend-orchestrator-hub
    restart: always
    ports:
      - '8080:80'
    environment:
      NOSQL_DATABASE_URL: mongodb://root:example@mongodb:27017
      REDIS_URL: redis://redis:6379
      MICROFRONTEND_HOST_FOLDER: /var/microfrontends
    volumes:
      - upload_microfrontends:/var/microfrontends
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

2.  Open `http://localhost:8080` and wait for the server to come up. This can take up to 2 minutes. Once the server is up and running, you can access MFE Orchestrator at `http://localhost:8080`.

3. Once the page loads you can enter your `email`, `password` and first project name to start using the Hub


