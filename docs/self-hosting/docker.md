---
sidebar_position: 1
---
# Docker
This page provides instructions to install MFE Orchestrator Hub using Docker.

You can find the official docker repo on [dockerhub](https://hub.docker.com/r/lory1990/mfe-orchestrator)

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- [Docker](https://docs.docker.com/get-started/get-docker/)

## Start container

Follow these steps to start the MFE Orchestrator:

1. Start the Docker container by using the below command. You may need to use `sudo` if you don't have permission to run `docker`:
```bash
docker run -p 8080:80 --name mfe-orchestrator-hub lory1990/mfe-orchestrator:latest -d
```
2.  Open `http://localhost:8080` and wait for the server to come up. This can take up to 2 minutes. Once the server is up and running, you can access MFE Orchestrator at `http://localhost:8080`.

3. Once the page loads you can enter your `email`, `password` and first project name to start using the Hub

> Remember that this configuration is for test purposes only. If you want to run the container in a test / production environment follow the [Docker Compose Installation](./docker-compose.md) guide.

## Container variables
Please refer to the [Environment Variables](./environment-variables.md) page for a list of available variables.