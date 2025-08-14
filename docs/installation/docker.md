---
sidebar_position: 1
---
# Docker
This page provides instructions to install MFE Orchestrator Hub using Docker.

You can find the official docker repo on [dockerhub](https://hub.docker.com/r/lory1990/microfrontend-orchestrator-hub)

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- [Docker](https://docs.docker.com/get-started/get-docker/)

## Start container

Follow these steps to start the MFE Orchestrator:

1. Start the Docker container by using the below command. You may need to use `sudo` if you don't have permission to run `docker`:
```bash
docker run -p 8080:80 --name mfe-orchestrator-hub lory1990/microfrontend-orchestrator-hub:latest -d
```
2.  Open `http://localhost:8080` and wait for the server to come up. This can take up to 2 minutes. Once the server is up and running, you can access MFE Orchestrator at `http://localhost:8080`.

3. Once the page loads you can enter your `email`, `password` and first project name to start using the Hub

> Remember that this configuration is for test purposes only. If you want to run the container in a test / production environment follow the [Docker Compose Installation](./docker-compose.md) guide.

## Container variables
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | URL of the frontend application. |
| `REGISTRATION_ALLOWED` | `false` | If `true`, allows new user registration. |
| `ALLOW_EMBEDDED_LOGIN` | `true` | If `true`, enables the login system within the application. |
| `MICROFRONTEND_HOST_FOLDER`| `/var/microfrontends` | Folder containing the host microfrontends. |
| `NOSQL_DATABASE_URL` | `mongodb://localhost:27017/microfrontend-orchestrator` | MongoDB database connection URL. |
| `REDIS_URL` | `redis://localhost:6379` | Redis server connection URL. |
| `REDIS_PASSWORD` | *(empty)* | Password for Redis access (if set). |
| `EMAIL_SMTP_HOST` | `smtp.example.com` | SMTP server host for sending emails. |
| `EMAIL_SMTP_PORT` | `587` | SMTP server port (e.g., 587 for TLS). |
| `EMAIL_SMTP_SECURE` | `false` | If `true`, uses secure connection (SSL/TLS). |
| `EMAIL_SMTP_USER` | *(empty)* | Username for SMTP authentication. |
| `EMAIL_SMTP_PASSWORD` | *(empty)* | Password for SMTP authentication. |
| `EMAIL_SMTP_FROM` | `no-reply@example.com` | Sender email address. |
| `JWT_SECRET` | `your-secret-key-here` | Secret key for JWT generation and validation. |
| `AUTH0_DOMAIN` | *(empty)* | Auth0 tenant domain. |
| `AUTH0_CLIENT_ID` | *(empty)* | Client ID of the Auth0 application. |
| `AUTH0_CLIENT_SECRET` | *(empty)* | Client secret of the Auth0 application. |
| `AUTH0_AUDIENCE` | *(empty)* | API Audience configured in Auth0. |
| `AUTH0_SECRET` | *(empty)* | Secret for Auth0 token validation. |
| `AZURE_ENTRAID_TENANT_ID` | *(empty)* | Azure Entra ID tenant ID. |
| `AZURE_ENTRAID_CLIENT_ID` | *(empty)* | Client ID of the registered Azure application. |
| `AZURE_ENTRAID_CLIENT_SECRET` | *(empty)* | Client secret of the registered Azure application. |
| `AZURE_ENTRAID_REDIRECT_URI` | *(empty)* | Redirect URI for Azure authentication. |
| `AZURE_ENTRAID_AUTHORITY` | `https://login.microsoftonline.com` | Authentication authority URL. |
| `AZURE_ENTRAID_SCOPES` | `openid profile email` | Required scopes during login. |
| `AZURE_ENTRAID_API_AUDIENCE` | *(empty)* | Protected API identifier in Azure. |
| `GOOGLE_CLIENT_ID` | *(empty)* | Client ID for Google OAuth authentication. |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Client secret for Google OAuth authentication. |
| `GOOGLE_REDIRECT_URI` | *(empty)* | Redirect URI for Google OAuth. |
| `GOOGLE_AUTH_SCOPE` | `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile` | Required scopes to get Google email and profile. |
| `ALLOWED_ORIGINS` | *(empty)* | List of allowed URLs for cross-origin requests. |
| `LOG_LEVEL` | `info` *(debug/info/warn/error)* | Logging level. |
