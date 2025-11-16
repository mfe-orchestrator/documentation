---
sidebar_position: 3
---

# Terraform

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

### 2. Initialize Terraform

Initialize Terraform to download the required providers:

```bash
terraform init
```

This will download the Docker provider (kreuzwerker/docker v3.6.1) and initialize the backend.

### 3. Review the Planned Changes And Apply

Before applying, review what Terraform will create:

```bash
terraform plan
```

This shows all resources that will be created, including:
- Docker networks
- Docker containers
- Docker volumes

Apply the Terraform configuration to deploy the infrastructure:

```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

:::tip
The apply process will create all necessary Docker resources to run MFE Orchestrator locally.
:::

### 4. Verify the Deployment

After successful deployment, verify that containers are running:

```bash
docker ps
```

You should see the MFE Orchestrator containers up and running.

## Accessing the Application

Once deployed, you can access the applcation at http://localhost:8080


## Container Variables

For a complete list of environment variables you can configure, please refer to the [Environment Variables](./environment-variables.md) page.