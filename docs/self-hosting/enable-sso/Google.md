---
title: Enable SSO with Google
sidebar_label: Google
description: Create a Google OAuth 2.0 client and point a self-hosted MFE Orchestrator at it, so users sign in with their Google account.
keywords: [google oauth, sso, authentication, self-hosting]
---

# Enable SSO with Google

This guide will walk you through the process of enabling Google OAuth authentication for your MFE Orchestrator instance.

## Prerequisites
- A Google Cloud Platform (GCP) account
- A project in the Google Cloud Console
- Docker environment for MFE Orchestrator

## Step 1: Create a New OAuth 2.0 Client ID

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Set the **Application type** to **Web application**
6. Add the following **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
7. Click **Create**
8. Note down the **Client ID** and **Client Secret**

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type and click **Create**
3. Fill in the required app information:
   - App name: "MFE Orchestrator"
   - User support email: Your email
   - Developer contact information: Your email
4. Click **Save and Continue**
5. In the **Scopes** section, add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Click **Save and Continue**
7. Add test users (optional) and complete the setup

## Step 3: Configure Environment Variables

Add the following environment variables to your Docker container configuration:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `GOOGLE_CLIENT_ID` | Client ID from Google Cloud Console | `1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client secret from the same OAuth client. **Required** | `GOCSPX-…` |
| `GOOGLE_REDIRECT_URI` | Redirect URI for authentication | `http://localhost:3000/api/auth/callback/google` |

:::caution `GOOGLE_CLIENT_SECRET` is not optional
The console signs in with the authorization-code flow: the browser gets a code, the backend exchanges
it for tokens at `https://oauth2.googleapis.com/token`, and that exchange sends the client secret.
With the secret missing, the Google consent screen appears and succeeds, and the login then fails at
the token step — which reads as a broken installation rather than a missing variable.
:::

### Variables that are read but have no effect

These three are accepted by the configuration schema and passed to the frontend, and nothing acts on
them. They are listed here so you do not spend time tuning them:

| Variable Name | Why it does nothing |
|---------------|---------------------|
| `GOOGLE_AUTH_SCOPE` | The login button requests `openid profile email`, hardcoded in the frontend |
| `GOOGLE_AUTH_HOSTED_DOMAIN` | Never read. Restrict the Workspace domain in the Google OAuth client instead |
| `GOOGLE_API_AUDIENCE` | Never read |

## Step 4: Update Docker Configuration

If you are using Docker Compose, add these variables to your `docker-compose.yml` file:

```yaml
services:
  mfe-orchestrator:
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
```

## Step 5: Restart Your Application

After updating the configuration, restart your Docker containers:

```bash
docker-compose down
docker-compose up -d
```

## Troubleshooting

- **400: redirect_uri_mismatch**: Ensure the redirect URI in your Google Cloud Console matches exactly with what's in your configuration
- **403: access_denied**: Verify that the Google OAuth consent screen is properly configured and published
- **Login succeeds at Google, then fails in the console**: almost always `GOOGLE_CLIENT_SECRET`
  missing or wrong — the code-for-token exchange is the step that needs it
- **Invalid client secret**: Ensure the client secret is correct and hasn't expired
- **Check Docker logs** for any authentication-related errors
