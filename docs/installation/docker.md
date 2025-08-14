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

> Remember that this configuration is for test porposes only. If you want to run the container in a test / production enviroment follow the [Docker Compose Installation](./docker-compose.md) guide.

## Container variables
| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | URL dell’applicazione frontend. |
| `REGISTRATION_ALLOWED` | `false` | Se `true` permette la registrazione di nuovi utenti. |
| `ALLOW_EMBEDDED_LOGIN` | `true` | Se `true` abilita il sistema di login all'interno dell'applicazione |
| `MICROFRONTEND_HOST_FOLDER`| `/var/microfrontends` | Cartella contenente i microfrontend host. |
| `NOSQL_DATABASE_URL` | `mongodb://localhost:27017/microfrontend-orchestrator` | URL di connessione al database MongoDB. |
| `REDIS_URL` | `redis://localhost:6379` | URL di connessione al server Redis. |
| `REDIS_PASSWORD` | *(vuoto)* | Password per l’accesso a Redis (se impostata). |
| `EMAIL_SMTP_HOST` | `smtp.example.com` | Host del server SMTP per inviare email. |
| `EMAIL_SMTP_PORT` | `587` | Porta del server SMTP (es. 587 per TLS). |
| `EMAIL_SMTP_SECURE` | `false` | Se `true` usa connessione sicura (SSL/TLS). |
| `EMAIL_SMTP_USER` | *(vuoto)* | Nome utente per autenticazione SMTP. |
| `EMAIL_SMTP_PASSWORD` | *(vuoto)* | Password per autenticazione SMTP. |
| `EMAIL_SMTP_FROM` | `no-reply@example.com` | Indirizzo email del mittente. |
| `JWT_SECRET` | `your-secret-key-here` | Chiave segreta per generazione e validazione JWT. |
| `AUTH0_DOMAIN` | *(vuoto)* | Dominio Auth0 del tenant. |
| `AUTH0_CLIENT_ID` | *(vuoto)* | Client ID dell’applicazione in Auth0. |
| `AUTH0_CLIENT_SECRET` | *(vuoto)* | Secret dell’applicazione in Auth0. |
| `AUTH0_AUDIENCE` | *(vuoto)* | API Audience configurato in Auth0. |
| `AUTH0_SECRET` | *(vuoto)* | Secret per la validazione dei token Auth0. |
| `AZURE_ENTRAID_TENANT_ID` | *(vuoto)* | ID del tenant Azure Entra ID. |
| `AZURE_ENTRAID_CLIENT_ID` | *(vuoto)* | Client ID dell’applicazione registrata in Azure. |
| `AZURE_ENTRAID_CLIENT_SECRET` | *(vuoto)* | Secret dell’applicazione registrata in Azure. |
| `AZURE_ENTRAID_REDIRECT_URI` | *(vuoto)* | URI di redirect per l’autenticazione Azure. |
| `AZURE_ENTRAID_AUTHORITY` | `https://login.microsoftonline.com` | URL dell’autorità di autenticazione. |
| `AZURE_ENTRAID_SCOPES` | `openid profile email` | Scopes richiesti durante il login. |
| `AZURE_ENTRAID_API_AUDIENCE` | *(vuoto)* | Identificatore dell’API protetta in Azure. |
| `GOOGLE_CLIENT_ID` | *(vuoto)* | Client ID per autenticazione Google OAuth. |
| `GOOGLE_CLIENT_SECRET` | *(vuoto)* | Client Secret per autenticazione Google OAuth. |
| `GOOGLE_REDIRECT_URI` | *(vuoto)* | URI di redirect per Google OAuth. |
| `GOOGLE_AUTH_SCOPE` | `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile` | Scopes richiesti per ottenere email e profilo Google. |
| `ALLOWED_ORIGINS` | *(vuoto)* | Lista di URL consentiti per le richieste cross-origin. |
| `LOG_LEVEL` | `info` *(debug/info/warn/error)* | Livello di log. |

