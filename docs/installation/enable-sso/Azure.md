# Azure AD (Entra ID)

This guide will walk you through the process of enabling Azure Active Directory (Azure AD) authentication for your MFE Orchestrator instance.

## Prerequisites
- An Azure AD tenant
- Global Administrator or Application Administrator access to your Azure AD tenant
- Docker environment for MFE Orchestrator (Terraform, docker-compose, Docker, etc.)

## Step 1: Register a New Application in Azure AD

1. Sign in to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Enter a name for your application (e.g., "MFE Orchestrator")
4. Select the supported account types (typically "Accounts in this organizational directory only")
6. Click **Register**

## Step 2: Configure Application Settings

1. In your application's overview page, note down the following values:
   - **Application (client) ID**
   - **Directory (tenant) ID**


## Step 3: Configure Environment Variables

Add the following environment variables to your Docker container configuration:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `AZURE_ENTRAID_TENANT_ID` | Your Azure AD tenant ID | `12345678-1234-1234-1234-123456789012` |
| `AZURE_ENTRAID_CLIENT_ID` | Application (client) ID from Azure AD | `87654321-4321-4321-4321-210987654321` |
| `AZURE_ENTRAID_REDIRECT_URI` | Redirect URI for authentication | `http://localhost:3000/api/auth/callback/azure-ad` |
| `AZURE_ENTRAID_AUTHORITY` | Azure AD authority URL | `https://login.microsoftonline.com` |
| `AZURE_ENTRAID_SCOPES` | Required scopes (space-separated) | `openid profile email` |
| `AZURE_ENTRAID_API_AUDIENCE` | API audience (usually same as client ID) | `87654321-4321-4321-4321-210987654321` |

## Step 5: Update Docker Configuration

If you are using Docker Compose, add these variables to your `docker-compose.yml` file:

```yaml
services:
  mfe-orchestrator:
    environment:
      - AZURE_ENTRAID_TENANT_ID=${AZURE_ENTRAID_TENANT_ID}
      - AZURE_ENTRAID_CLIENT_ID=${AZURE_ENTRAID_CLIENT_ID}
      - AZURE_ENTRAID_REDIRECT_URI=${AZURE_ENTRAID_REDIRECT_URI}
      - AZURE_ENTRAID_AUTHORITY=${AZURE_ENTRAID_AUTHORITY}
      - AZURE_ENTRAID_SCOPES=${AZURE_ENTRAID_SCOPES}
      - AZURE_ENTRAID_API_AUDIENCE=${AZURE_ENTRAID_API_AUDIENCE}
```

## Step 6: Restart Your Application

After updating the configuration, restart your Docker containers:

```bash
docker-compose down
docker-compose up -d
```

## Troubleshooting

- **Insufficient permissions**: Verify that all required API permissions are granted admin consent
- **Redirect URI mismatch**: Ensure the redirect URI in your application matches exactly with what's configured in Azure AD
- **Token validation errors**: Check that your system clock is synchronized (JWT validation is time-sensitive)
- **Check Docker logs** for any authentication-related errors