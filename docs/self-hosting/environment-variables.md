---
sidebar_position: 5
title: Container environment variables
sidebar_label: Environment variables
description: "Every environment variable that configures the MFE Orchestrator container: database connections, authentication providers, email services and more."
keywords: [environment variables, container configuration, self-hosting, reference]
---

# Container environment variables

Environment variables allow you to configure the MFE Orchestrator container according to your specific needs. These variables control various aspects of the application, from database connections to authentication providers and email services.

## How to Configure

You can set environment variables in different ways depending on your deployment method:

- **Docker**: Use the `-e` flag: `docker run -e VARIABLE_NAME=value`
- **Docker Compose**: Add them to the `environment` section in your `docker-compose.yml`
- **Terraform**: Configure them in your Terraform variables file
- **Helm**: Put the plain ones under `env` and the sensitive ones under `envSecrets` in
  `values.yaml` — see [Helm](./helm.md#configuration)

:::tip
For security-sensitive values like passwords and secrets, consider using Docker secrets or environment variable files (`.env`) that are not committed to version control.
:::

## Available Variables

### General Configuration
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | URL of the frontend application. |
| `BACKEND_URL` | *(empty, falls back to `FRONTEND_URL` + `/api`)* | Public URL of the API, written into the generated configuration. |
| `PORT` | `3000` | Port the backend listens on, behind the in-container nginx. |
| `NODE_ENV` | `prod` *(development/prod/test/local)* | Node.js environment mode. Any other value stops the boot. |
| `REGISTRATION_ALLOWED` | `true` | If `true`, allows new user registration. |
| `ALLOW_EMBEDDED_LOGIN` | `true` | If `true`, enables the login system within the application. |
| `MICROFRONTEND_HOST_FOLDER`| `/upload-microfrontends` | Folder containing the host microfrontends. |
| `ALLOWED_ORIGINS` | *(empty)* | List of allowed URLs for cross-origin requests comma separated. |
| `ALLOWED_SERVE_ORIGINS` | *(falls back to `ALLOWED_ORIGINS`)* | The same list, applied only to the `/serve/*` endpoints your host applications call. |
| `RATE_LIMIT_MAX` | `100` | Requests per IP per minute. An empty value fails validation — leave it unset to keep the default. |
| `MARKETING_OPT_IN_ENABLED` | `false` | If `true`, the registration form collects a marketing consent, which the profile page can then change. |
| `MARKETING_OPT_IN_VERSION` | `1` | Version of the consent text, stored together with the consent. |
| `NPM_REGISTRY_URL` | `https://registry.npmjs.org` | Registry queried by the dependency analysis for published versions. |

### Database Configuration

#### MongoDB
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `NOSQL_DATABASE_URL` | `mongodb://localhost:27017/microfrontend-orchestrator` | MongoDB database connection URL. |
| `NOSQL_DATABASE_NAME` | `microfrontend-orchestrator` | MongoDB database name. |
| `NOSQL_DATABASE_USERNAME` | `root` | MongoDB username. |
| `NOSQL_DATABASE_PASSWORD` | `example` | MongoDB password. |

#### Redis
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis server connection URL. |
| `REDIS_PASSWORD` | *(empty)* | Password for Redis access (if set). |

### Email Configuration (SMTP)
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `EMAIL_SMTP_HOST` | `smtp.example.com` | SMTP server host for sending emails. |
| `EMAIL_SMTP_PORT` | `587` | SMTP server port (e.g., 587 for TLS). |
| `EMAIL_SMTP_SECURE` | `false` | If `true`, uses secure connection (SSL/TLS). |
| `EMAIL_SMTP_USER` | *(empty)* | Username for SMTP authentication. |
| `EMAIL_SMTP_PASSWORD` | *(empty)* | Password for SMTP authentication. |
| `EMAIL_SMTP_FROM` | `no-reply@example.com` | Sender email address. |

### Security & Authentication

#### JWT
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `JWT_SECRET` | `your-secret-key-here` | Secret key for JWT generation and validation. |

#### Auth0
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AUTH0_DOMAIN` | *(empty)* | Auth0 tenant domain. |
| `AUTH0_CLIENT_ID` | *(empty)* | Client ID of the Auth0 application. |
| `AUTH0_AUDIENCE` | *(empty)* | API Audience configured in Auth0. |

#### Azure Entra ID
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AZURE_ENTRAID_TENANT_ID` | *(empty)* | Azure Entra ID tenant ID. |
| `AZURE_ENTRAID_CLIENT_ID` | *(empty)* | Client ID of the registered Azure application. |
| `AZURE_ENTRAID_REDIRECT_URI` | *(empty)* | Redirect URI for Azure authentication. |
| `AZURE_ENTRAID_AUTHORITY` | `https://login.microsoftonline.com` | Authentication authority URL. |
| `AZURE_ENTRAID_SCOPES` | `openid profile email` | Required scopes during login. |
| `AZURE_ENTRAID_API_AUDIENCE` | *(empty)* | Protected API identifier in Azure. |

#### Google OAuth
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `GOOGLE_CLIENT_ID` | *(empty)* | Client ID for Google OAuth authentication. |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Client secret for Google OAuth authentication. |
| `GOOGLE_REDIRECT_URI` | *(empty)* | Redirect URI for Google OAuth. |
| `GOOGLE_AUTH_SCOPE` | `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile` | Required scopes to get Google email and profile. |
| `GOOGLE_AUTH_HOSTED_DOMAIN` | *(empty)* | Restricts the Google login to a single Workspace domain. |
| `GOOGLE_API_AUDIENCE` | *(empty)* | Protected API identifier for Google. |

#### GitHub (code repositories)
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `CODE_REPOSITORY_GITHUB_CLIENT_ID` | *(empty)* | Client ID for the GitHub OAuth application used to connect repositories. |
| `CODE_REPOSITORY_GITHUB_CLIENT_SECRET` | *(empty)* | Client secret of the same application. |

### Observability and telemetry

Self-hosted installations send one anonymous ping per day — aggregate counters only, no names, no
URLs, no personal data — and it can be turned off with any of the three switches below.

| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `TELEMETRY_DISABLED` | *(empty)* | If `true`, turns off the anonymous telemetry ping. |
| `DO_NOT_TRACK` | *(empty)* | If `1`, turns off the anonymous telemetry ping. |
| `TELEMETRY_ENABLED` | *(empty)* | Explicit switch for the telemetry ping. |
| `TELEMETRY_ENDPOINT` | `https://telemetry.mfe-orchestrator.dev/api/telemetry/self-hosted` | Where the anonymous ping is sent. |
| `TELEMETRY_INTERVAL_HOURS` | `24` | Hours between two pings. |
| `SENTRY_DSN` | *(empty)* | Sentry DSN of the backend. Leave empty to disable error reporting. |

:::note Variables outside this list are ignored
The container validates its configuration against a fixed schema and drops anything it does not
know, so a misspelled name fails silently rather than being picked up. `LOG_LEVEL` and
`AZURE_ENTRAID_CLIENT_SECRET`, which earlier versions of this page listed, are read by nothing.
:::
