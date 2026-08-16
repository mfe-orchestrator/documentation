---
sidebar_position: 4
title: Self-host on Kubernetes with Helm
sidebar_label: Helm (Kubernetes)
description: Install MFE Orchestrator Hub on Kubernetes with the official Helm chart — configuration, secrets, persistence of the uploaded microfrontends, ingress and probes.
keywords: [helm, kubernetes, self-hosting, installation, chart, ingress, persistent volume]
---

# Self-host on Kubernetes with Helm

The chart lives in the repository, under
[`helm/mfe-orchestrator`](https://github.com/mfe-orchestrator/mfe-orchestrator/tree/main/helm/mfe-orchestrator).
It installs the standard image `lory1990/mfe-orchestrator`, which serves the frontend and the API
behind nginx on port `80`.

:::info MongoDB and Redis are not part of the chart
The chart deploys the application only. Point it at instances you already run, or install them with
their own charts — there is an example [below](#mongodb-and-redis).
:::

## Prerequisites

- A Kubernetes cluster and [`kubectl`](https://kubernetes.io/docs/tasks/tools/) configured against it
- [Helm](https://helm.sh/) 3
- A MongoDB and a Redis the cluster can reach
- The repository cloned locally, or a packaged copy of the chart

## Install

```bash
git clone https://github.com/mfe-orchestrator/mfe-orchestrator.git
cd mfe-orchestrator

helm install mfe-orchestrator ./helm/mfe-orchestrator \
  --namespace mfe-orchestrator --create-namespace \
  --set env.NOSQL_DATABASE_URL="mongodb://root:example@mongodb:27017" \
  --set env.REDIS_URL="redis://redis:6379" \
  --set envSecrets.JWT_SECRET="$(openssl rand -hex 32)"
```

To distribute the chart instead of cloning it on every cluster:

```bash
helm package helm/mfe-orchestrator            # -> mfe-orchestrator-<version>.tgz
helm install mfe-orchestrator mfe-orchestrator-<version>.tgz -f my-values.yaml
```

Useful while you iterate on your values:

```bash
helm lint helm/mfe-orchestrator
helm template mfe-orchestrator helm/mfe-orchestrator -f my-values.yaml
helm test mfe-orchestrator      # hits /api/echo from inside the cluster
helm upgrade mfe-orchestrator ./helm/mfe-orchestrator -f my-values.yaml
```

## Configuration

Every [environment variable](./environment-variables.md) the application understands is set from
`values.yaml`, and any variable not listed there can simply be added to the same maps:

| Values key | Rendered as | Use for |
| --- | --- | --- |
| `env` | ConfigMap `<release>-env` | Plain configuration |
| `envSecrets` | Secret `<release>-env` | Passwords, client secrets, the JWT key |
| `existingSecret` | `envFrom.secretRef` list | Secrets managed outside the chart (sealed secrets, ESO …) |
| `existingConfigMap` | `envFrom.configMapRef` list | Configuration managed outside the chart |
| `extraEnv` | Container `env` entries | `valueFrom` references (secret keys, field refs) |

```yaml
env:
  FRONTEND_URL: https://console.example.com
  REGISTRATION_ALLOWED: false
  NOSQL_DATABASE_URL: mongodb://root:example@mongodb:27017
  REDIS_URL: redis://redis:6379

envSecrets:
  JWT_SECRET: a-32-bytes-random-string
  NOSQL_DATABASE_PASSWORD: example

extraEnv:
  - name: GOOGLE_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: google-oauth
        key: client-secret
```

Both maps accept native YAML scalars — values are quoted when rendered, so
`EMAIL_SMTP_PORT: 587` and `REGISTRATION_ALLOWED: true` are fine.

Precedence, from lowest to highest: `env` → `envSecrets` → `existingConfigMap` → `existingSecret`
→ `extraEnv`.

:::caution An empty value is skipped, not set
Leaving a value empty or null means the variable is not injected at all and the application keeps
its own default. That is what you want for most of `values.yaml` — with one exception:
`RATE_LIMIT_MAX` is validated as a number, so an empty value fails validation and keeps the
container from starting. It ships commented out for that reason; uncomment it only to set a real
number.
:::

With `restartOnConfigChange: true` (the default) the pods roll automatically when the rendered
ConfigMap or Secret changes, so a `helm upgrade` that only touches configuration still takes
effect.

## Image version

`image.tag` defaults to the chart's `appVersion`, so a plain install runs the version the chart was
released with — `3.1.0` for chart `0.1.2`. Override it to pin a different one:

```yaml
image:
  tag: "3.1.0"
```

## Storage of the uploaded microfrontends

Uploaded bundles are stored on a PersistentVolumeClaim mounted at `MICROFRONTEND_HOST_FOLDER`
(default `/upload-microfrontends`); setting `persistence.mountPath` overrides the mount point and
keeps the variable in sync.

```yaml
persistence:
  enabled: true
  size: 20Gi
  storageClass: fast-rwo
  # existingClaim: my-claim
```

With `persistence.enabled: false` the microfrontends live in the container filesystem and are lost
at every restart. If you scale beyond one replica, use a `ReadWriteMany` volume — otherwise keep
`replicaCount: 1`.

## Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: 50m
  hosts:
    - host: console.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: mfe-orchestrator-tls
      hosts:
        - console.example.com
```

Align `env.FRONTEND_URL` — and `env.BACKEND_URL`, which defaults to `<FRONTEND_URL>/api` — with the
public hostname. The uploads go through this ingress, so raise the body size limit if your bundles
are large.

## MongoDB and Redis

Installed alongside, with the Bitnami charts:

```bash
helm install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb \
  --set auth.rootPassword=example
helm install redis oci://registry-1.docker.io/bitnamicharts/redis \
  --set auth.enabled=false

helm install mfe-orchestrator ./helm/mfe-orchestrator \
  --set env.NOSQL_DATABASE_URL="mongodb://root:example@mongodb:27017" \
  --set env.REDIS_URL="redis://redis-master:6379"
```

MongoDB offers transactions only on a replica set. Against a standalone instance the backend
detects it and runs the multi-document operations — creating a deployment among them — without one.

## Health and scaling

- **Probes** hit `/api/echo`, the public health endpoint of the backend. Liveness and readiness are
  on by default; a startup probe is available for slow clusters (`startupProbe.enabled`).
- **Autoscaling** is off by default (`autoscaling.enabled`). Enable it only with a `ReadWriteMany`
  volume, or the second pod cannot mount the same claim.
- **Strategy** is a rolling update with `maxUnavailable: 0`. On a `ReadWriteOnce` volume, switch
  `strategy.type` to `Recreate` so two pods never fight over the same PVC.

The full values reference is in the
[chart README](https://github.com/mfe-orchestrator/mfe-orchestrator/blob/main/helm/mfe-orchestrator/README.md).
