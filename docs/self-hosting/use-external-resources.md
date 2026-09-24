---
sidebar_position: 6
description: "Point a self-hosted MFE Orchestrator at a MongoDB and Redis you already run: the variables, the replica set requirement, and the encryption key that matters."
title: Use an external MongoDB and Redis
sidebar_label: External resources
keywords: [mongodb, redis, external database, production, managed service]
---

# Use an external MongoDB and Redis

The standard image ships no database. It reads a connection URL for each of the two stores it needs
and connects on boot — so pointing it at a managed MongoDB and a managed Redis is a matter of
setting variables, not of changing the deployment. This is what the [Helm chart](./helm.md) assumes,
and what the [Docker Compose](./docker-compose.md) file replaces with two containers of its own for
convenience.

Neither connection is required for the container to start. Each plugin logs a warning and returns if
its URL is missing, so an installation with a typo in one variable comes up and answers requests
while doing nothing useful. Check the boot log rather than the container status.

## MongoDB

```bash
NOSQL_DATABASE_URL=mongodb+srv://cluster0.example.mongodb.net/?retryWrites=true&w=majority
NOSQL_DATABASE_USERNAME=mfe-orchestrator
NOSQL_DATABASE_PASSWORD=…
NOSQL_DATABASE_NAME=microfrontend-orchestrator
```

| Variable | What it does |
| --- | --- |
| `NOSQL_DATABASE_URL` | The connection string. Unset, the backend logs *"Cannot see MongoDB database URL, will not connect"* and starts with no database |
| `NOSQL_DATABASE_USERNAME` | Passed to the driver as `user`. Credentials embedded in the URL work too — use one or the other, not both |
| `NOSQL_DATABASE_PASSWORD` | Passed to the driver as `pass` |
| `NOSQL_DATABASE_NAME` | Passed as `dbName`, and it wins over a database named in the URL path |

The driver is configured with `retryWrites: true` and `w: "majority"`, so the cluster has to be
reachable for a write to be acknowledged — a failover is retried, a partition is not hidden.

:::caution Transactions need a replica set
On connecting, the backend asks the server whether it is part of a replica set and logs which it
found. Against a standalone `mongod` it runs the multi-document operations — creating a deployment
among them — without a transaction, so a failure halfway through leaves a partial write. Every
managed MongoDB (Atlas, DocumentDB, a self-hosted replica set) satisfies this; a single `mongod` you
started by hand does not.
:::

:::note Encrypt what you store in a database you do not own
This is the case the key exists for. Without `SECRETS_ENCRYPTION_KEY` the credentials a project
stores — bucket keys, storage connection strings, service account files, repository tokens — are
written to MongoDB in plain text, and a managed cluster means backups, snapshots and support access
you do not control. Set it before the first project stores anything:

```bash
SECRETS_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

32 bytes, base64 or hex; a value of any other length stops the boot rather than failing quietly, and
the key that wrote a value is the only one that reads it back. See
[environment variables](./environment-variables.md#secrets-encryption).
:::

## Redis

```bash
REDIS_URL=rediss://my-cache.example.com:6380
REDIS_PASSWORD=…
```

`REDIS_URL` is handed to the client unmodified, so it must be a URL with a scheme: `redis://` for
plaintext, `rediss://` for TLS. A bare hostname is not a usable value — the client rejects it and the
connection never comes up.

:::caution The Redis user is always `default`
The client is built with `username: "default"` in the source, and only the password is configurable.
A Redis whose ACL puts your credentials on another user cannot be reached: create the credentials on
`default`, or embed `user:password@` in `REDIS_URL` and leave `REDIS_PASSWORD` unset.
:::

## What stays local

The uploaded microfrontend bundles are not in either store. They live on the filesystem at
`MICROFRONTEND_HOST_FOLDER`, so that path still needs a volume that survives a restart — a
PersistentVolumeClaim under Helm, a named volume under Docker. Moving them off the node is a
different decision: give the project a
[storage bucket](../microfrontends/hosting-options.md) and the platform stops holding the files at
all.

Every variable named here is listed with its exact semantics on the
[Environment variables](./environment-variables.md) page.
