---
sidebar_position: 4
---

# Environment Variables

Environment variables allow you to configure the MFE Orchestrator container according to your specific needs. These variables control various aspects of the application, from database connections to authentication providers and email services.

## How to Configure

You can set environment variables in different ways depending on your deployment method:

- **Docker**: Use the `-e` flag: `docker run -e VARIABLE_NAME=value`
- **Docker Compose**: Add them to the `environment` section in your `docker-compose.yml`
- **Terraform**: Configure them in your Terraform variables file

:::tip
For security-sensitive values like passwords and secrets, consider using Docker secrets or environment variable files (`.env`) that are not committed to version control.
:::

## Available Variables

### General Configuration
| Variable | Default Value | Description |
|-----------|---------------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | URL of the frontend application. |
| `REGISTRATION_ALLOWED` | `false` | If `true`, allows new user registration. |
| `ALLOW_EMBEDDED_LOGIN` | `true` | If `true`, enables the login system within the application. |
| `MICROFRONTEND_HOST_FOLDER`| `/var/microfrontends` | Folder containing the host microfrontends. |
| `ALLOWED_ORIGINS` | *(empty)* | List of allowed URLs for cross-origin requests comma separated. |
| `LOG_LEVEL` | `info` *(debug/info/warn/error)* | Logging level. |

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
| `GOOGLE_REDIRECT_URI` | *(empty)* | Redirect URI for Google OAuth. |
| `GOOGLE_AUTH_SCOPE` | `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile` | Required scopes to get Google email and profile. |
