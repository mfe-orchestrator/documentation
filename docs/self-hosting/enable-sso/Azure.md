---
title: Enable SSO with Microsoft Entra ID
sidebar_label: Azure AD (Entra ID)
description: Register an application in Microsoft Entra ID (Azure AD) and point a self-hosted MFE Orchestrator at it, so users sign in with their organisation account.
keywords: [entra id, azure ad, sso, oauth, authentication]
---

# Enable SSO with Microsoft Entra ID

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
2. Go to **Authentication** > **Add a platform** > **Single-page application** and register the
   console's own origin as the redirect URI — `https://console.example.com`, or
   `http://localhost:8080` for a local installation. Not a path under it: the origin itself.

:::caution The redirect URI is the console origin, and is not configurable
The console signs in with MSAL in the browser, and MSAL is constructed with
`redirectUri: window.location.origin` in the frontend source. Whatever you put in
`AZURE_ENTRAID_REDIRECT_URI` is never sent, so a callback path registered in Entra ID — anything
ending in `/api/auth/callback/azure-ad`, for instance — can only ever produce a redirect URI
mismatch. Register the origin the users open the console at.
:::


## Step 3: Configure Environment Variables

Add the following environment variables to your Docker container configuration:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `AZURE_ENTRAID_TENANT_ID` | Your Azure AD tenant ID. **Required** — it is what enables the provider | `12345678-1234-1234-1234-123456789012` |
| `AZURE_ENTRAID_CLIENT_ID` | Application (client) ID from Azure AD. **Required** | `87654321-4321-4321-4321-210987654321` |

Those two are the whole configuration. The tenant ID is the switch: the backend adds Azure to the
configuration it serves the console only when it is set.

### Variables that are read but have no effect

The frontend builds MSAL from the client ID and the tenant ID and hardcodes everything else, so the
four variables below are accepted and then ignored. Configure the equivalent on the Entra ID app
registration:

| Variable Name | Why it does nothing |
|---------------|---------------------|
| `AZURE_ENTRAID_REDIRECT_URI` | MSAL uses `window.location.origin` — see the caution above |
| `AZURE_ENTRAID_AUTHORITY` | The authority is built as `https://login.microsoftonline.com/<tenant id>` |
| `AZURE_ENTRAID_SCOPES` | Login requests the MSAL defaults; token acquisition asks for `openid profile email offline_access` |
| `AZURE_ENTRAID_API_AUDIENCE` | Never read |

## Step 5: Update Docker Configuration

If you are using Docker Compose, add these variables to your `docker-compose.yml` file:

```yaml
services:
  mfe-orchestrator:
    environment:
      - AZURE_ENTRAID_TENANT_ID=${AZURE_ENTRAID_TENANT_ID}
      - AZURE_ENTRAID_CLIENT_ID=${AZURE_ENTRAID_CLIENT_ID}
```

## Step 6: Restart Your Application

After updating the configuration, restart your Docker containers:

```bash
docker-compose down
docker-compose up -d
```

## Troubleshooting

- **Insufficient permissions**: Verify that all required API permissions are granted admin consent
- **Redirect URI mismatch**: the console always sends its own origin, so the fix is on the Entra ID
  side — the app registration must list that exact origin (scheme, host and port, no trailing path)
  as a **Single-page application** redirect URI. Changing `AZURE_ENTRAID_REDIRECT_URI` has no effect
- **Token validation errors**: Check that your system clock is synchronized (JWT validation is time-sensitive)
- **Check Docker logs** for any authentication-related errors