---
sidebar_position: 3
title: Self-host with Terraform
sidebar_label: Terraform
description: Install MFE Orchestrator Hub with Terraform against Docker infrastructure as code, including the prerequisites and the variables the configuration expects.
keywords: [terraform, infrastructure as code, self-hosting, docker, installation]
---

# Self-host with Terraform

This page provides instructions to install MFE Orchestrator Hub using Terraform with Docker infrastructure as code.

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Terraform](https://www.terraform.io/)** (v1.0 or higher)
- **[Docker](https://www.docker.com/)** running on your machine
- **Git** to clone the repository

## Installation Steps

### 1. Clone the Repository

First, clone the MFE Orchestrator repository and navigate to the Terraform directory:

```bash
git clone https://github.com/mfe-orchestrator/mfe-orchestrator.git
cd mfe-orchestrator/terraform
```

### 2. Set the variables

The module needs two values that differ per server and are secret, so they stay out of the
repository. Put them in a `terraform.tfvars` next to the configuration, or export them as
`TF_VAR_<name>`:

```hcl
frontend_url = "http://localhost:8080"
jwt_secret   = "<output of openssl rand -hex 32>"
```

| Variable | Default | Meaning |
| --- | --- | --- |
| `frontend_url` | *(required)* | Public URL of the console, without trailing slash. The MCP and OAuth URLs are derived from it. |
| `jwt_secret` | *(required)* | Signing secret for console and MCP tokens, at least 32 bytes. |
| `mcp_enabled` | `true` | Exposes the [MCP server](../ai/mcp-server.md) at `<frontend_url>/api/mcp`. |
| `anthropic_api_key` | *(empty)* | When set, turns on the system AI with Claude. See the [AI variables](./environment-variables.md#ai). |

### 3. Initialize Terraform

Initialize Terraform to download the required providers:

```bash
terraform init
```

This will download the Docker provider (kreuzwerker/docker v3.6.1) and initialize the backend.

### 4. Review the Planned Changes And Apply

Before applying, review what Terraform will create:

```bash
terraform plan
```

This shows all resources that will be created, including:
- Docker networks
- Docker containers
- Docker images

There are no `docker_volume` resources: each container gets a **host bind mount** under
`${path.root}/volumes/` — `volumes/mongodb`, `volumes/redis` and `volumes/mfe-orchestrator` for the
uploaded microfrontends. The directories are created next to the root module, so the state of the
installation lives in your working copy and is deleted with it.

Apply the Terraform configuration to deploy the infrastructure:

```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

:::tip
The apply process will create all necessary Docker resources to run MFE Orchestrator locally.
:::

### 5. Verify the Deployment

After successful deployment, verify that containers are running:

```bash
docker ps
```

You should see the MFE Orchestrator containers up and running.

## Accessing the Application

Once deployed, you can access the application at `http://localhost:8080`.

An installation with no users answers with the **Initial Setup** screen rather than a login form.
Read [The first startup](./first-startup.md) before you fill it in: it is public and ungated, so
whoever reaches it first owns the installation, and the project name you type becomes a permanent
slug.


## Images

| Container | Image |
| --- | --- |
| MFE Orchestrator | `lory1990/mfe-orchestrator:development` |
| MongoDB | `mongo:8-noble` |
| Redis | `redis:8.0.2-alpine` |

MongoDB and Redis are pinned. The orchestrator image follows the `development` tag, which is
rebuilt on every push to the development branch and is pulled again whenever its digest changes. To
run a release instead, change the tag in `terraform/modules/microfronted-orchestrator-hub.tf` to
`5.0.0` and apply again: `terraform apply` run today and in three months then brings up the same
stack.

## Before you call it production

The module is a local development stack, and two of its defaults are unsafe anywhere else:

- **MongoDB credentials are hardcoded.** `terraform/modules/mongo.tf` sets `root` / `example`, and
  the orchestrator's `NOSQL_DATABASE_URL` names the same pair. Change both, together.
- **No `SECRETS_ENCRYPTION_KEY` is set.** Add `SECRETS_ENCRYPTION_KEY=<openssl rand -base64 32>`
  to the `env` list in `terraform/modules/microfronted-orchestrator-hub.tf` if the installation will
  hold storage credentials or repository tokens. See [Encryption at rest](./encryption-at-rest.md).

The module also sets `REGISTRATION_ALLOWED=true`, which only shows the *Register* link; see
[the first startup](./first-startup.md#the-endpoint-stays-open).

[Docker Compose](./docker-compose.md) warns about the same defaults; the reasoning is there.

## Container Variables

For a complete list of environment variables you can configure, please refer to the [Environment Variables](./environment-variables.md) page.