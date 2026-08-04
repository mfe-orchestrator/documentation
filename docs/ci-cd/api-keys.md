---
sidebar_position: 1
---

# API keys

An API key authenticates a machine — a CI pipeline, a deploy script, an automation job — against a
single project. Keys live under **Settings → API Keys**.

## Creating a key

1. Go to **Settings → API Keys** and click **Create API Key**.
2. Give it a **Name** describing where it will be used, e.g. *catalog GitHub Actions*.
3. Pick an **Expiration Date**. The key expires at the end of the selected day.
4. Click **Create Key**.

The key is displayed once, in a dialog with a **Copy & Close** button.

:::caution Shown exactly once
The key is stored hashed and can never be retrieved again. If you lose it, delete the key and create
a new one. The list view shows *"Key not available for security reasons"* for this reason.
:::

## Expiry is mandatory

There is no non-expiring key. This is deliberate: a credential that never expires is one nobody ever
rotates.

The list marks keys as **Active**, **Expiring soon** or **Expired**, so it is worth glancing at the
page occasionally. Note that an expired key causes pipelines to fail at *upload* time — after a
successful build — which is a confusing failure if you have forgotten the expiry exists.

:::tip
When you create a key, put its expiry date in whatever calendar your team actually reads. Rotate by
creating the new key first, updating the consumer, then deleting the old one.
:::

## Roles

| Role | Intended for |
| --- | --- |
| **MANAGER** | Publishing builds and managing project resources — what CI needs |
| **VIEWER** | Read-only access |

Keys created automatically when MFE Orchestrator scaffolds a repository are `MANAGER`, valid for one
year.

## Keys created for you

You often do not need to create a key at all. When MFE Orchestrator creates a repository from a
template, it also creates a `MANAGER` key and stores it in your Git provider:

| Provider | Where the key is stored |
| --- | --- |
| GitHub | Repository/organization secret `MICROFRONTEND_ORCHESTRATOR_API_KEY` |
| GitLab | Group CI/CD variable `MICROFRONTEND_ORCHESTRATOR_API_KEY` |
| Azure DevOps | Variable group `MFE_ORCHESTRATOR_SECRETS`, variable `MICROFRONTEND_ORCHESTRATOR_API_KEY` |

The generated pipelines read exactly that name, which is why they work on their first run.

You will find these keys in the API Keys list named
`MFE_ORCHESTRATOR_DEPLOY_SECRET - <provider> - <repository>`. Do not delete them unless you intend
to break the corresponding pipeline.

## Using a key

Send it in the `api-key` header:

```bash
curl -X POST \
  -H "api-key: $MFE_ORCHESTRATOR_API_KEY" \
  -F "file=@dist.zip" \
  "<API_BASE>/microfrontends/by-slug/catalog/upload/1.4.0"
```

A query parameter is also accepted, for clients that cannot set headers:

```
<API_BASE>/microfrontends/by-slug/catalog/upload/1.4.0?apiKey=…
```

:::caution Prefer the header
Query strings end up in access logs, browser history and proxy logs. Use `?apiKey=` only when
setting a header is genuinely impossible.
:::

The project is derived from the key, so requests authenticated this way do not need a `project-id`
header.

## Revoking and deleting

Two distinct actions:

- **Revoke** sets the key to inactive. It stops working immediately, but the record remains, which
  keeps the audit trail intact.
- **Delete** removes it entirely.

Revoke when you suspect exposure and want the history; delete when tidying up keys whose purpose is
gone.

## Good practice

**One key per consumer.** A key per pipeline, not one shared across the organisation. Rotating or
revoking then affects one thing, and the name tells you what breaks.

**Never commit a key.** Use your CI's secret store. Keys are UUIDs and match no distinctive pattern,
so secret scanners will not catch one you paste into a repository.

**Scope by project.** A key grants access to its project only. Cross-project automation needs one
key per project — which is the correct blast radius, not an inconvenience to work around.

**Treat a leaked key as a live incident.** A `MANAGER` key can publish arbitrary JavaScript to your
production microfrontends. Revoke first, investigate second.
