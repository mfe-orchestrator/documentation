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

:::note "Default Value" means what the schema declares
The container validates its environment against a fixed schema, and most variables have no default
in it. Where the column below reads *(no default)* the variable is genuinely unset unless you set
it — the platform logs a warning and does not connect, it does not fall back to `localhost`. The
`root` / `example` credentials you see elsewhere in these pages are the
[Docker Compose](./docker-compose.md) fixture, not a fallback the application applies.
:::

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
| `NOSQL_DATABASE_URL` | *(no default)* | MongoDB connection URL, for example `mongodb://root:example@mongodb:27017`. Unset, the backend logs *"Cannot see MongoDB database URL, will not connect"* and starts with no database at all. |
| `NOSQL_DATABASE_NAME` | *(no default)* | MongoDB database name, for example `microfrontend-orchestrator`. |
| `NOSQL_DATABASE_USERNAME` | *(no default)* | MongoDB username. `root` is the Compose fixture, not a default. |
| `NOSQL_DATABASE_PASSWORD` | *(no default)* | MongoDB password. `example` is the Compose fixture, not a default. |

#### Redis
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `REDIS_URL` | *(no default)* | Redis connection URL, scheme included — `redis://host:6379` or `rediss://host:6379` for TLS. Unset, the backend logs *"Cannot see redis URL, will not connect"* and runs without Redis. |
| `REDIS_PASSWORD` | *(empty)* | Password for Redis access. The username is always `default`; a Redis fronted by another ACL user cannot be configured. |

### Email Configuration (SMTP)
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `EMAIL_SMTP_HOST` | *(no default)* | SMTP server host. It is the switch for the whole feature: unset, the platform sends no email — no invitations, no password resets. |
| `EMAIL_SMTP_PORT` | `587` | SMTP server port (e.g., 587 for TLS). |
| `EMAIL_SMTP_SECURE` | `false` | If `true`, uses secure connection (SSL/TLS). |
| `EMAIL_SMTP_USER` | *(empty)* | Username for SMTP authentication. |
| `EMAIL_SMTP_PASSWORD` | *(empty)* | Password for SMTP authentication. |
| `EMAIL_SMTP_FROM` | *(no default)* | Sender email address, for example `no-reply@example.com`. |

### Security & Authentication

#### JWT
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `JWT_SECRET` | `your-secret-key` | Secret key for JWT generation and validation. |

:::caution The JWT default is a published constant
`your-secret-key` is in the source, so an installation that leaves `JWT_SECRET` unset signs its
tokens with a key anybody can read. Set one — `openssl rand -hex 32` — everywhere except the
all-in-one image, which generates one into its volume on the first start.
:::

#### Secrets encryption

| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `SECRETS_ENCRYPTION_KEY` | *(empty)* | 32 bytes, base64 or hex. Encrypts the credentials the console stores for a project — bucket keys, storage connection strings, service account files, repository tokens — and stops the API from returning them. |

Generate one with `openssl rand -base64 32`. Two things to know before you set it:

- **Unset, those credentials are stored in the clear** and the backend says so in a warning at boot.
  Anybody who reads the database — a dump, a backup, a hosted MongoDB you do not own — reads usable
  credentials.
- **A value of the wrong length stops the boot.** The key is validated at startup and a key that
  does not decode to exactly 32 bytes fails the container rather than silently doing nothing. The
  same applies to changing a key once values have been written with it: the old key is what reads
  them back.

The full treatment, including the migration of values written before the key existed, is in the
product's own
[`docs/SECRETS.md`](https://github.com/mfe-orchestrator/mfe-orchestrator/blob/main/docs/SECRETS.md).

#### Auth0
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AUTH0_DOMAIN` | *(empty)* | Auth0 tenant domain. |
| `AUTH0_CLIENT_ID` | *(empty)* | Client ID of the Auth0 application. |
| `AUTH0_AUDIENCE` | *(empty)* | API Audience configured in Auth0. |
| `AUTH0_SCOPE` | `openid profile email` | OAuth scopes requested at login. Served to the frontend but not applied by it — see [Auth0](./enable-sso/Auth0.md). |

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

Worse than a name that is dropped is a name that is accepted. `HOST`, `NOSQL_DB_URL`,
`NOSQL_DB_DATABASE` and `NOSQL_DB_PASSWORD` are declared in the schema, so they pass validation and
the container starts without a complaint — and nothing reads them. Setting `NOSQL_DB_URL` instead of
`NOSQL_DATABASE_URL` gets you an installation that looks configured and has no database. Use the
names in the tables above.
:::
