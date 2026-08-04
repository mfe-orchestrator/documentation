---
sidebar_position: 1
---

# Overview

An **environment** is a deployment stage of your project: `dev`, `uat`, `prod`, or whatever your
release process calls them. Environments are where versions and configuration diverge — the same
microfrontend can be at `1.2.0` in production and `1.4.0-rc1` in UAT at the same time.

Environments live under **Settings → Environments**.

## Creating an environment

Click **New Environment** and fill in:

| Field | Notes |
| --- | --- |
| **Name** | Display name, e.g. *Production* |
| **Slug** | URL-friendly identifier, e.g. `prod`. Unique within the project, and part of your public serve URLs |
| **Description** | Free text |
| **Production** | Marks this as a production stage |
| **Color** | Used to tag the environment throughout the console |
| **Allowed Domains** | The domains your app is served from — see [Allowed domains](./domains.md) |

When you set up a project through the wizard you are offered a set of **default environments**
to start from, and you can add your own alongside them.

:::caution Slugs are public
The environment slug appears in serve URLs such as
`<API_BASE>/serve/all/<projectId>/<environmentSlug>`. Renaming it breaks any consumer using that
form of the URL.
:::

## The environment selector

Most pages in the console are scoped to one environment, chosen from the selector in the page
header. Environment Variables, Deployments and Integration all follow it — if you are wondering
why a page shows nothing, check which environment is selected.

The order of environments in the selector is configurable, so you can list them in the order
they appear in your release flow rather than alphabetically.

## What is environment-specific and what is not

This distinction matters, and it is not obvious at first:

| Object | Scope |
| --- | --- |
| Microfrontends | **Project** — one definition, shared by all environments |
| Environment variables | **Environment** |
| Deployments | **Environment** — each has its own numbering and history |
| Storages / buckets | **Project** |
| Code repositories | **Project** |
| API keys | **Project** |
| Members | **Project** |

So a microfrontend exists once, but the **version that is live** is a property of each
environment's active deployment. That is the mechanism by which one definition serves many
stages.

## Deleting an environment

Deleting an environment removes it along with its deployment history and its variables. You are
asked to confirm by name. There is no undo.

## Where to go next

- [Allowed domains](./domains.md) — how the platform resolves an environment from a browser request
- [Environment variables](./environment-variables.md) — per-environment runtime configuration
- [Deployments](../deployments/overview.md) — activating configuration in an environment
