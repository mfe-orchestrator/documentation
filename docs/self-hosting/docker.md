---
sidebar_position: 1
title: Self-host with Docker
sidebar_label: Docker
description: Run MFE Orchestrator Hub from the official Docker image — the all-in-one image for a single container installation, or the standard image against your own MongoDB and Redis.
keywords: [docker, self-hosting, installation, container, all-in-one]
---

# Self-host with Docker

This page provides instructions to install MFE Orchestrator Hub using Docker.

You can find the official docker repo on [dockerhub](https://hub.docker.com/r/lory1990/mfe-orchestrator)

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- [Docker](https://docs.docker.com/get-started/get-docker/)

## Which image

Two images are published, and the difference is what runs inside the container:

| Image | Contains | Use it for |
| --- | --- | --- |
| `lory1990/mfe-orchestrator:all-in-one` | Orchestrator, MongoDB, Redis and Nginx | A working installation from a single `docker run` |
| `lory1990/mfe-orchestrator:3.1.0` | Orchestrator and Nginx only | Installations that point at a MongoDB and a Redis you already run |

The standard image does **not** bring a database with it: started on its own it has nothing to
connect to. Give it `NOSQL_DATABASE_URL` and `REDIS_URL`, or use
[Docker Compose](./docker-compose.md), which brings all three up together.

## Start the all-in-one container

```bash
docker run -d --name mfe-orchestrator --restart unless-stopped \
  -p 8080:80 -v mfe-data:/data lory1990/mfe-orchestrator:all-in-one
```

Open `http://localhost:8080` and wait for the server to come up — this can take up to 2 minutes on
the first start. Enter your `email`, `password` and first project name, and you are in.

What you should know about this image:

- **Everything persistent lives in `/data`**: the database (`/data/db`), the Redis dump
  (`/data/redis`), the uploaded microfrontends (`/data/microfrontends`) and the JWT secret
  (`/data/secrets`). Mount that one volume and the installation survives an image upgrade.
- **The JWT secret is generated on the first start** and kept in the volume, so tokens are not
  signed with a well known key. Pass `JWT_SECRET` yourself if you prefer to manage it.
- **MongoDB and Redis only listen on the loopback of the container**, so there is no database port
  to firewall and no default password to change. Only port 80 is published.
- **MongoDB runs as a single node replica set** (`MONGO_REPLICA_SET=rs0`), which is what makes
  transactions available to the backend.
- Every [environment variable](./environment-variables.md) works here too, for example
  `-e REGISTRATION_ALLOWED=true -e FRONTEND_URL=https://mfe.example.com`.
- The four processes are supervised: they are restarted when they crash and, if one cannot start at
  all, the container exits instead of pretending to be healthy.
  `docker exec mfe-orchestrator supervisorctl status` shows their state.

:::caution One container is one failure domain
The all-in-one image trades isolation for simplicity, and no service in it can be scaled or
upgraded on its own. For production, or whenever you already run a managed MongoDB or Redis, use
[Docker Compose](./docker-compose.md) or the [Helm chart](./helm.md).
:::

## Start the standard container

```bash
docker run -d --name mfe-orchestrator --restart unless-stopped \
  -p 8080:80 \
  -e NOSQL_DATABASE_URL="mongodb://root:example@mongodb:27017" \
  -e REDIS_URL="redis://redis:6379" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -v upload_microfrontends:/upload-microfrontends \
  lory1990/mfe-orchestrator:3.1.0
```

A standalone MongoDB works, but MongoDB only offers **transactions** on a replica set: pointed at a
standalone `mongod`, the backend detects it and runs the multi-document operations — creating a
deployment among them — without one. Run MongoDB as a replica set, even a single node one, wherever
that matters to you. It is what the all-in-one image does.

## Image tags

| Tag | What it points at |
| --- | --- |
| `3.1.0` | A released version. This is what you want in production |
| `latest` | The head of the development branches, rebuilt on every push |
| `3.1.0-all-in-one` | The all-in-one image of a released version |
| `all-in-one` | The head of the development branches, all-in-one flavour |

`latest` is not a release channel here: it is rebuilt from the branches, so pin a version tag
anywhere you care about reproducibility. The [Docker Compose file](./docker-compose.md), the
[Terraform module](./terraform.md) and the [Helm chart](./helm.md) shipped with the project all
name a released version for that reason.

## Container variables

Please refer to the [Environment Variables](./environment-variables.md) page for a list of
available variables.
