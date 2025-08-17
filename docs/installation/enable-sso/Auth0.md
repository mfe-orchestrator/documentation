# Auth0

This guide will walk you through the process of enabling Auth0 authentication for your MFE Orchestrator instance.

## Prerequisites
- An Auth0 account and access to the Auth0 dashboard
- Docker environment for MFE Orchestrator (terraform, docker-compose, docker,..)

## Step 1: Configure Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** > **Applications**
3. Click **+ Create Application**
4. Enter a name for your application (e.g., "MFE Orchestrator")
5. Select **Single Page Web Applications** as the application type
6. Click **Create**

## Step 2: Configure Application Settings

1. In your Auth0 application settings, go to the **Settings** tab
2. Note down the following values:
   - **Domain** (e.g., `your-tenant.auth0.com`)
   - **Client ID**
4. Click **Save Changes**

## Step 3: Set Up API (Optional but Recommended)

1. Go to **Applications** > **APIs**
2. Click **+ Create API**
3. Enter a name (e.g., "MFE Orchestrator API")
4. Set the **Identifier** (Audience) to a URL (e.g., `https://api.yourdomain.com`)
5. Click **Create**
6. Note down the **API Audience** value

## Step 4: Configure Environment Variables

Add the following environment variables to your Docker container configuration as follows:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `AUTH0_DOMAIN` | *(empty)* | Auth0 tenant domain. |
| `AUTH0_CLIENT_ID` | *(empty)* | Client ID of the Auth0 application. |
| `AUTH0_AUDIENCE` | *(empty)* | API Audience configured in Auth0. |
| `AUTH0_SCOPE` | `openid profile email` | OAuth scopes (space-separated) |

## Step 5: Update Docker Configuration

If you are using docker comse add those variables to `docker-compose.yml` file under the `environment` section of your service:

```yaml
services:
  microfrontend-orchestrator-hub:
    environment:
      - AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
      - AUTH0_ISSUER=${AUTH0_ISSUER}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - AUTH0_SCOPE=openid profile email
```

## Step 6: Restart Your Application

After updating the configuration, restart your Docker containers:

```bash
docker-compose down
docker-compose up -d
```
