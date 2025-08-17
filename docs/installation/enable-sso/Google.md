# Google 

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
| `GOOGLE_REDIRECT_URI` | Redirect URI for authentication | `http://localhost:3000/api/auth/callback/google` |
| `GOOGLE_AUTH_SCOPE` | Required scopes (space-separated) | `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile` |
| `GOOGLE_AUTH_HOSTED_DOMAIN` | (Optional) Restrict to specific domain | `yourdomain.com` |
| `GOOGLE_API_AUDIENCE` | (Optional) API audience for additional APIs | `https://www.googleapis.com/auth/...` |

## Step 4: Update Docker Configuration

If you are using Docker Compose, add these variables to your `docker-compose.yml` file:

```yaml
services:
  microfrontend-orchestrator-hub:
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
      - GOOGLE_AUTH_SCOPE=${GOOGLE_AUTH_SCOPE}
      - GOOGLE_AUTH_HOSTED_DOMAIN=${GOOGLE_AUTH_HOSTED_DOMAIN}
      - GOOGLE_API_AUDIENCE=${GOOGLE_API_AUDIENCE}
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
- **Invalid client secret**: Ensure the client secret is correct and hasn't expired
- **Check Docker logs** for any authentication-related errors
