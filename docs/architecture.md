---
sidebar_position: 3.5
title: Architecture
sidebar_label: Architecture
description: "How MFE Orchestrator is put together: the orchestrator itself, the database and cache behind it, the artifact storage options — internal or your own cloud bucket — and how a deployment reaches each environment."
keywords: [architecture, diagram, deployment, mongodb, redis, object storage, self-hosting]
---

# Architecture

MFE Orchestrator is a **control plane**: it stores what your microfrontends are, which versions
belong to which environment, and where their files live — then answers, at runtime, the single
question your host application asks: *what should I load?*

This page draws that out. If you have not read [Core concepts](./core-concepts.md) yet, start
there: the boxes below are the objects described on that page.

## The system at a glance

The orchestrator ships as **one container**. It serves the console, the authenticated management
API and the public serve API from the same process, and keeps its state in MongoDB and Redis.
Artifacts — the actual microfrontend bundles — live outside the database, either on the
orchestrator's own storage or in a cloud bucket you own.

```mermaid
flowchart LR
    subgraph yours["Your development workflow"]
        direction TB
        repo["Git repository<br/>GitHub · GitLab · Azure DevOps"]
        ci["CI/CD pipeline<br/>GitHub Actions · GitLab CI · Azure Pipelines"]
        repo --> ci
    end

    subgraph orch["MFE Orchestrator — one container"]
        direction TB
        console["Console<br/>React SPA"]
        mgmt["Management API<br/>authenticated: session or API key"]
        serve["Serve API<br/>public, unauthenticated"]
        storage["Storage layer<br/>resolves a version to bytes"]
        console --> mgmt
        mgmt --> storage
        serve --> storage
    end

    subgraph state["State"]
        direction TB
        mongo[("MongoDB<br/>projects, environments, microfrontends,<br/>deployments, storages, members, API keys")]
        redis[("Redis<br/>cache")]
    end

    subgraph artifacts["Where the bundles are stored"]
        direction TB
        internal["Internal storage<br/>MICROFRONTEND_HOST_FOLDER<br/>default /var/microfrontends"]
        s3["Amazon S3"]
        blob["Azure Blob Storage"]
        gcs["Google Cloud Storage"]
        ext["Your CDN or static host<br/>hosting type: Custom URL"]
    end

    subgraph browsers["Your users' browsers"]
        direction TB
        host["Host application<br/>Module Federation shell"]
        remote["Remotes"]
        host --> remote
    end

    idp["Identity providers<br/>Auth0 · Azure Entra ID · Google · local login"]
    smtp["SMTP server<br/>invitations, password reset"]

    ci -->|"upload dist.zip + version"| mgmt
    mgmt -->|"scaffold repo, inject pipeline, create deploy secret"| repo

    mgmt --> mongo
    mgmt --> redis
    serve --> mongo
    serve --> redis

    console -.-> idp
    mgmt -.-> idp
    mgmt -.-> smtp

    storage <-->|"write on upload · read on request"| internal
    storage <-->|"your credentials, private bucket"| s3
    storage <--> blob
    storage <--> gcs

    host -->|"GET /serve/all/:projectId/:envSlug"| serve
    host -->|"GET .../remoteEntry.js"| serve
    remote -.->|"fetched directly, the platform only hands out the URL"| ext
```

A few things worth reading off the diagram:

- **The browser never talks to your bucket.** For internal storage and for
  [Custom Source](./microfrontends/hosting-options.md#custom-source-your-own-bucket) buckets, the
  serve API reads the bytes server-side with your credentials and streams them back. Your bucket
  stays private and needs no CORS configuration. The one exception is
  [Custom URL](./microfrontends/hosting-options.md#custom-url), where the platform returns a URL
  and the browser fetches it itself.
- **The serve API is public and unauthenticated** by design — it is called from browsers. The
  management API is the authenticated surface, used by the console and by CI with an
  [API key](./ci-cd/api-keys.md).
- **Artifacts are not in the database.** MongoDB holds configuration and deployment snapshots;
  bundles live on disk or in object storage.

## Deployments across environments

A project's configuration is mutable — versions, variables and storage settings are drafts. A
**deployment** freezes them into an immutable snapshot for **one environment**, and exactly one
snapshot is active per environment at any moment. That is what lets `prod` keep serving `1.2.0`
while you stage `1.4.0` in `uat` from the same project.

```mermaid
flowchart TB
    subgraph cfg["Project configuration — mutable drafts"]
        direction LR
        sel["Microfrontends<br/>+ selected version<br/>+ hosting config"]
        varsdev["Variables (dev)"]
        varsuat["Variables (uat)"]
        varsprod["Variables (prod)"]
        st["Storage configuration"]
    end

    subgraph dev["Environment: dev"]
        direction TB
        devA["Deployment 12 · ACTIVE<br/>catalog 1.5.0 · checkout 0.9.1"]
        devH["Deployments 11, 10, … · history<br/>redeployable"]
    end

    subgraph uat["Environment: uat"]
        direction TB
        uatA["Deployment 5 · ACTIVE<br/>catalog 1.4.0 · checkout 0.9.0"]
        uatH["Deployments 4, 3, … · history<br/>redeployable"]
    end

    subgraph prod["Environment: prod · isProduction"]
        direction TB
        prodA["Deployment 3 · ACTIVE<br/>catalog 1.2.0 · checkout 0.8.4"]
        prodH["Deployments 2, 1 · history<br/>redeployable"]
    end

    cfg -->|"Deploy dev"| dev
    cfg -->|"Deploy uat"| uat
    cfg -->|"Deploy prod"| prod

    devA -->|"answers every serve call for dev"| serveDev["dev.example.com"]
    uatA -->|"answers every serve call for uat"| serveUat["staging.example.com"]
    prodA -->|"answers every serve call for prod"| serveProd["app.example.com"]
```

The snapshot is a **copy**, not a set of references — editing a microfrontend afterwards does not
reach back into it. Two consequences:

- **Rollback is activation, not rebuild.** Redeploying `#2` in `prod` re-activates an older
  snapshot; the artifacts it points at were never deleted.
- **Promotion is just a deployment.** Select the version live in `uat`, deploy `prod`. The bundle
  is not rebuilt or copied — both environments point at the same stored files, and what differs is
  the [environment variables](./environments/environment-variables.md) each snapshot carries.

Which environment a request belongs to can be given explicitly, or resolved from the browser's
`Referer` against the environment's [allowed domains](./environments/domains.md) — the arrows on
the right of the diagram. That is what lets one build run unchanged in every environment.

See [Deployments](./deployments/overview.md) for the full behaviour.

## How a request for a bundle is answered

The hosting type of each microfrontend decides where the bytes come from. The host application's
URL does not change between the three cases — only what the orchestrator does behind it.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (host app)
    participant S as Serve API
    participant DB as MongoDB
    participant F as Internal storage
    participant C as Your cloud bucket
    participant X as Your CDN

    B->>S: GET /serve/all/{projectId}/{envSlug}
    S->>DB: active deployment of this environment
    DB-->>S: microfrontends + versions + variables
    S-->>B: URLs, versions, globalVariables

    B->>S: GET /serve/mfe/files/.../assets/remoteEntry.js
    S->>DB: resolve version + hosting type from the snapshot

    alt Hosting type: MFE Orchestrator Hub
        S->>F: read {folder}/{projectSlug}-{projectId}/{mfeSlug}/{version}/...
        F-->>S: bytes
    else Hosting type: Custom Source (your bucket)
        S->>C: read with your credentials, bucket stays private
        C-->>S: bytes
    end

    S-->>B: bytes · entry point sent no-store, other assets cacheable

    opt Hosting type: Custom URL
        S-->>B: URL with $version substituted
        B->>X: GET the file directly
        X-->>B: bytes
    end
```

The entry point is always served with `Cache-Control: no-cache, no-store, must-revalidate`, while
the hashed assets around it stay cacheable — which is why a deployment takes effect immediately
without stale chunks. All served files carry `Cross-Origin-Resource-Policy: cross-origin` so a
host on a different origin can load them.

Details: [Serve API reference](./integration/serve-api.md),
[Hosting options](./microfrontends/hosting-options.md), [Buckets](./buckets/overview.md).

### Artifact path layout

Both internal storage and your own bucket use the same deterministic layout, with the project id
in the prefix so several projects — and several installations — can share one bucket:

```
<root>/<projectSlug>-<projectId>/<microfrontendSlug>/<version>/…
```

Versions sit side by side and nothing is overwritten on release. That is what makes rollback
instant, and why you may want a lifecycle rule on old objects — see
[Housekeeping](./buckets/overview.md#housekeeping).

## Running the orchestrator itself

The same control plane runs either as the hosted console or on your own infrastructure. Only the
API base URL differs. Self-hosted, the reference topology is the container plus MongoDB, Redis and
a persistent volume:

```mermaid
flowchart LR
    subgraph host["Your infrastructure — Docker Compose, Kubernetes or Terraform"]
        direction TB
        app["mfe-orchestrator<br/>container port 80"]
        mongo[("mongodb<br/>NOSQL_DATABASE_URL<br/>volume: mongodb_data")]
        redis[("redis<br/>REDIS_URL<br/>volume: redis_data")]
        vol["Persistent volume<br/>MICROFRONTEND_HOST_FOLDER<br/>volume: upload_microfrontends"]
        app --> mongo
        app --> redis
        app --> vol
    end

    users["Browsers · CI · console users"] -->|"FRONTEND_URL"| app
    app -.->|"optional"| cloud["Your S3 / Azure Blob / GCS bucket"]
    app -.->|"optional"| idp["Auth0 · Entra ID · Google"]
    app -.->|"optional"| smtp["SMTP"]
```

:::caution Mount the artifact folder
`MICROFRONTEND_HOST_FOLDER` must sit on a persistent volume. Without it, every container restart
loses the builds uploaded to the internal storage — in the reference `docker-compose.yaml` that is
the `upload_microfrontends` volume.
:::

MongoDB and Redis can be replaced by managed services; the identity providers, SMTP and cloud
buckets are all optional. See [Docker Compose](./self-hosting/docker-compose.md),
[Terraform](./self-hosting/terraform.md),
[Use external resources](./self-hosting/use-external-resources.md) and the full
[environment variable reference](./self-hosting/environment-variables.md).
