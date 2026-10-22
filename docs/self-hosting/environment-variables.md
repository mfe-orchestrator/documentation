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
| `FRONTEND_URL` | `http://localhost:3000` | Public URL of the console. Required with `MCP_ENABLED`. |
| `BACKEND_URL` | *(empty, falls back to `FRONTEND_URL` + `/api`)* | Public URL of the API, written into the generated configuration. |
| `PORT` | `3000` | Port the backend listens on, behind the in-container nginx. |
| `NODE_ENV` | `prod` *(development/prod/test/local)* | Node.js environment mode. Any other value stops the boot. |
| `REGISTRATION_ALLOWED` | `true` | **Hides the *Register* link; it does not close the route.** The backend reads it in one place only, to build the `canRegister` flag the console uses to decide what to render. With it set to `false` both `POST /users/registration` and `POST /startup/registration` still create usable accounts. See [The first startup](./first-startup.md#the-endpoint-stays-open). |
| `ALLOW_EMBEDDED_LOGIN` | `true` | If `true`, enables the login system within the application. |
| `MICROFRONTEND_HOST_FOLDER`| `/upload-microfrontends` | Folder containing the host microfrontends. |
| `ALLOWED_ORIGINS` | *(empty)* | List of allowed URLs for cross-origin requests comma separated. |
| `ALLOWED_SERVE_ORIGINS` | *(falls back to `ALLOWED_ORIGINS`)* | The same list, applied only to the `/serve/*` endpoints your host applications call. |
| `RATE_LIMIT_MAX` | `100` | Requests per IP per minute. An empty value fails validation — leave it unset to keep the default. |
| `MARKETING_OPT_IN_ENABLED` | `false` | If `true`, the registration form collects a marketing consent, which the [profile page](../account/profile.md#marketing-communications) can then change. The platform records the consent and never sends a commercial email of its own. |
| `MARKETING_OPT_IN_VERSION` | `1` | Version of the consent text, stored together with the consent, so an old consent stays attributable to the wording it was given for. |
| `TRUST_PROXY` | *(unset; `127.0.0.1` in the Docker images)* | Proxies trusted for `X-Forwarded-For`: `true` or a comma separated list of addresses or CIDRs (`loopback` and `uniquelocal` work too); a hop count is refused. Behind a Kubernetes ingress or a load balancer add its address, for example `loopback,10.0.0.0/8`, or every client shares one rate limit bucket. |
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

:::danger Five console screens exist only because these are set
Account activation, password recovery, password reset and both invitation acceptance screens are all
reached through a token delivered by email, and by no other means. With `EMAIL_SMTP_HOST` unset an
installation cannot activate an account, cannot reset a password and cannot confirm an invitation —
and the password reset reports success while sending nothing.

[Activation, password reset and invitations](../account/email-flows.md) sets out what each flow does
in that state.
:::

### Security & Authentication

#### JWT
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `JWT_SECRET` | `your-secret-key` | Secret key for JWT generation and validation. With [`MCP_ENABLED`](#mcp-server) it must be your own, at least 32 bytes. |

:::caution The JWT default is a published constant
`your-secret-key` is in the source, so an installation that leaves `JWT_SECRET` unset signs its
tokens with a key anybody can read. Set one — `openssl rand -hex 32` — everywhere except the
all-in-one image, which generates one into its volume on the first start.
:::

#### Secrets encryption

| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `SECRETS_ENCRYPTION_KEY` | *(empty)* | 32 bytes, base64 or hex. Encrypts the credentials the console stores for a project — bucket keys, storage connection strings, service account files, repository tokens, the API keys of the organizations' AIs — and stops the API from returning them. |

Generate one with `openssl rand -base64 32`. Two things to know before you set it:

- **Unset, those credentials are stored in the clear** and the backend says so in a warning at boot.
  Anybody who reads the database — a dump, a backup, a hosted MongoDB you do not own — reads usable
  credentials.
- **A value of the wrong length stops the boot.** The key is validated at startup and a key that
  does not decode to exactly 32 bytes fails the container rather than silently doing nothing. The
  same applies to changing a key once values have been written with it: the old key is what reads
  them back.

The full treatment — the threat model, the exact list of encrypted fields, why global variables stay
in the clear on purpose, and what losing the key costs — is on
[Encryption at rest](./encryption-at-rest.md).

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

### AI

AI is off until an AI is available: either the organizations add their own in the console, or the
installation describes a **system AI** offered to all of them. With no provider and no
`ANTHROPIC_API_KEY` there is no system AI, and a project whose organization defines none has AI off.
How the system AI and the organizations' own AIs fit together is on
[AIs of an organization](../ai/ai-models.md#the-system-ai).

A provider named without its credentials stops the boot, so a typo shows up at start and not at the
first question.

| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AI_PROVIDER` | *(empty)* | Provider of the system AI: `anthropic`, `azure-foundry`, `aws-bedrock`, `azure-openai` or `gemini`. Empty with `ANTHROPIC_API_KEY` set means `anthropic`. |
| `AI_MAX_EFFORT` | *(empty: every level the model takes)* | Highest [reasoning effort](../ai/reasoning-effort.md) users can pick with the system AI: `low`, `medium`, `high`, `xhigh` or `max`. Higher efforts take more tokens per answer. |
| `ASSISTANT_RATE_LIMIT_MAX` | `20` | Questions to the assistant per IP per minute. Each one is a paid model call, so the ceiling is separate from `RATE_LIMIT_MAX`. |
| `REPOSITORIES_FOLDER` | `/repositories` (`/data/repositories` in the all-in-one image) | Where [Edit with AI](../microfrontends/edit-with-ai.md#configuration) clones the repositories, as `<org>/<project>/<microfrontend>`. A cache: deleting it only costs a new clone. |
| `REPOSITORIES_MAX_SIZE_MB` | `500` | A repository bigger than this on disk is refused, and removed, after the clone. |
| `REPOSITORIES_EVICT_AFTER_DAYS` | `14` | Working copies not used for this many days are deleted. |

#### Anthropic
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `ANTHROPIC_API_KEY` | *(empty)* | API key for `anthropic`. |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Claude model for `anthropic`. |

#### Azure AI Foundry
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AZURE_FOUNDRY_RESOURCE` | *(empty)* | Resource name for `azure-foundry`, as in `https://<resource>.services.ai.azure.com`. |
| `AZURE_FOUNDRY_API_KEY` | *(empty)* | API key for `azure-foundry`. |
| `AZURE_FOUNDRY_MODEL` | `claude-opus-5-5` | Name of the Claude deployment on Foundry. |

#### AWS Bedrock
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AWS_BEDROCK_REGION` | *(empty)* | AWS region for `aws-bedrock`. |
| `AWS_BEDROCK_ACCESS_KEY_ID` | *(empty)* | Access key allowed to invoke the model. |
| `AWS_BEDROCK_SECRET_ACCESS_KEY` | *(empty)* | Secret of that access key. |
| `AWS_BEDROCK_MODEL` | *(empty)* | Model id or inference profile, for example `anthropic.claude-opus-5-5`. Required with `aws-bedrock`. |

#### Azure OpenAI
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `AZURE_OPENAI_ENDPOINT` | *(empty)* | `https://<resource>.openai.azure.com/` for `azure-openai`. |
| `AZURE_OPENAI_API_KEY` | *(empty)* | API key for `azure-openai`. |
| `AZURE_OPENAI_DEPLOYMENT` | *(empty)* | Deployment of the GPT model, which is also the model name. |
| `AZURE_OPENAI_REASONING` | `false` | `true` for reasoning deployments (o-series, GPT-5 and later): the effort is sent as `reasoning.effort`. |
| `AZURE_OPENAI_ENDPOINT_SUFFIXES` | *(empty)* | Host suffixes an organization's Azure OpenAI endpoint may name besides the public cloud's (`.openai.azure.com`, `.cognitiveservices.azure.com`, `.services.ai.azure.com`), comma separated. Meant for the sovereign clouds, for example `.openai.azure.us,.openai.azure.cn`. |

#### Gemini
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `GEMINI_API_KEY` | *(empty)* | API key for `gemini`. |
| `GEMINI_MODEL` | *(empty)* | Gemini model. Required with `gemini`: none is assumed, as Gemini models are retired often. |

### MCP server

The remote [MCP server](../ai/mcp-server.md) is off until you turn it on. `MCP_ENABLED` needs a
`FRONTEND_URL` and a `JWT_SECRET` of your own, at least 32 bytes (`openssl rand -hex 32`): with a
placeholder, a short secret or no `FRONTEND_URL` the backend refuses to start.

| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `MCP_ENABLED` | `false` | Turns on the [MCP server](../ai/mcp-server.md#turning-it-on) for AI clients and the OAuth 2.1 endpoints in front of it. |
| `MCP_API_KEY_ENABLED` | `true` | Lets MCP clients that cannot do OAuth use a project API key on `/mcp` instead. |
| `MCP_RATE_LIMIT_MAX` | `120` | MCP requests per minute for each OAuth grant or API key, on top of `RATE_LIMIT_MAX` per IP. |
| `MCP_DCR_ENABLED` | `true` | Lets MCP clients register themselves (dynamic client registration, RFC 7591). |
| `MCP_CIMD_ENABLED` | `true` | Accepts MCP clients identified by a client metadata document URL. |
| `CIMD_ALLOWED_HOSTS` | *(any host)* | Comma separated hosts allowed to publish a client metadata document. |
| `OAUTH_ISSUER_URL` | *(falls back to `BACKEND_URL`)* | Issuer of the MCP access tokens, for when the public URLs cannot be derived from `BACKEND_URL` and `FRONTEND_URL`. |
| `MCP_RESOURCE_URL` | *(falls back to the issuer + `/mcp`)* | Public URL of the MCP endpoint. |

### Observability and telemetry

Self-hosted installations send one anonymous ping per day — aggregate counters only, no names, no
URLs, no personal data — and it can be turned off with any of the three switches below. The exact
payload, the full precedence of the switches and the endpoint that shows what your own installation
would send are on [Telemetry](./telemetry.md).

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
