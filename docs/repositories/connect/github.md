---
title: Connect a GitHub repository
sidebar_label: GitHub
description: Connect GitHub, cloud or self-hosted, to MFE Orchestrator with a Personal Access Token, so it can read your repositories and scaffold new microfrontends into them.
keywords: [github, personal access token, repository, connection]
---

# Connect a GitHub repository

This guide will walk you through connecting your GitHub repositories to MFE Orchestrator.

## Prerequisites

- An active [GitHub](https://github.com) account
- Access to at least one organization or personal repository
- Permission to authorize OAuth applications — on an organization, an owner may have to approve it

:::info GitHub uses OAuth, not a token
Unlike [GitLab](./gitlab.md) and [Azure DevOps](./azure.dev-ops.md), GitHub does not ask you for a
Personal Access Token. You authorize MFE Orchestrator on GitHub instead, and it holds the
resulting credential for you.
:::

## Step 1: Navigate to Code Repositories

1. Go to **[Code Repositories](https://console.mfe-orchestrator.dev/code-repositories)** in MFE Orchestrator
![The Code Repositories page](../../assets/code-repositories.png)
2. Click the **Add Repository** button
![The Add Repository dialog, listing the available providers](../../assets/add-repository-provider.png)
3. Select **GitHub** as your provider

## Step 2: Authorize on GitHub

Selecting GitHub sends you to GitHub's own authorization page. Sign in if you are not already, then
review the access being requested and confirm. GitHub asks for the scopes MFE Orchestrator needs to
read your repositories, create one from a template, and store the deploy secret its pipeline uses:
`repo`, `public_repo`, `read:user`, `read:org`, `workflow` and `admin:org`.

If the repositories you want belong to an organization, grant access to that organization on the
same page. Without it, only your personal repositories appear later.

:::caution Organization approval
Some organizations require an owner to approve third-party OAuth applications. If your organization
does, the authorization stays *pending* until an owner approves it, and the organization's
repositories will not be listed in the meantime.
:::

Once you confirm, GitHub returns you to the console and the connection appears in the repository
list. From there you can [create a microfrontend from a template](../../microfrontends/create-a-microfrontend.md),
which scaffolds the repository and its pipeline for you.

## Troubleshooting

**GitHub is not offered in the Add Repository dialog** — the installation has no GitHub OAuth
application configured. On a self-hosted instance, set `CODE_REPOSITORY_GITHUB_CLIENT_ID` and
`CODE_REPOSITORY_GITHUB_CLIENT_SECRET`; see
[Environment Variables](../../self-hosting/environment-variables.md).

**Your organization's repositories are missing** — either organization access was not granted
during authorization, or an owner has not yet approved the application. Re-run the authorization
from **Code Repositories → Add Repository → GitHub** and grant the organization explicitly.