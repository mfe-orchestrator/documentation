---
sidebar_position: 3
title: Runtime environment variables
sidebar_label: Environment variables
description: Runtime key/value pairs scoped to an environment and read by the browser after the bundle has loaded, so a single build can be configured differently in each stage.
keywords: [environment variables, runtime configuration, per environment config]
---

# Runtime environment variables

Environment variables in MFE Orchestrator are **runtime** configuration: `key`/`value` pairs
scoped to an environment, read by the browser after the bundle has loaded.

:::info Not to be confused with…
These are the variables of *your application*. The variables that configure the MFE Orchestrator
container itself are documented under
[Self Hosting → Environment Variables](../self-hosting/environment-variables.md).
:::

## Why runtime and not build time

A variable baked in at build time (`import.meta.env.VITE_API_URL`, `process.env.API_URL`) makes
the artifact environment-specific. Promoting a build from UAT to production then means rebuilding
it, which means the thing you tested is not the thing you shipped.

Serving the values at runtime instead means one artifact travels through every stage, and the
stage supplies its own configuration:

```
        one build of catalog@1.4.0
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
   dev            uat            prod
API_URL=…dev   API_URL=…uat   API_URL=…com
```

## Managing variables

Open **Environment Variables** in the sidebar and use **Add Variable**. Each variable is a `key`
with one value per environment; keys are unique per environment.

![The Environment Variables page, one column per environment](../assets/environment-variables-list.png)

The dialog asks for the key once and then for its value in each environment, which is the shape
you almost always want — the same key with a different value per stage. Leave a value empty and
the code reading it in that environment will find `undefined`.

![The Add Variable dialog, with a value per environment](../assets/environment-variable-dialog.png)

:::caution Not a secret store
Environment variables are served to the browser by a **public, unauthenticated** endpoint. Anyone
who knows your project and environment id can read them. Never put API secrets, private keys,
database credentials or tokens here. Use them for public configuration only: API base URLs,
feature flags, tracking ids, public keys.
:::

## Reading them in your application

Variables are exposed in two forms. The full details, including examples, are in
[Runtime configuration](../integration/runtime-configuration.md); in short:

**As a script that populates `window.globalConfig`** — add it to your `index.html` before your
bundle:

```html
<script src="<API_BASE>/serve/global-variables/auto/<projectId>/index.js"></script>
```

```js
const apiUrl = window.globalConfig?.API_URL
```

**As JSON**, if you prefer to fetch them yourself:

```js
const vars = await fetch('<API_BASE>/serve/global-variables/auto/<projectId>')
  .then(r => r.json())
```

Neither address names an environment: the platform resolves it from the domain the page is
served on, so one `index.html` covers every stage. The console's
**Integration → Environment variables** tab shows both snippets with your project id already
filled in.

## Variables and deployments

Like everything else, variables are captured in the deployment snapshot. Adding or changing a
variable does not affect a running environment until you deploy.

This is deliberate: it means a configuration change is as auditable and as reversible as a code
change. Rolling back a deployment rolls back its variables along with its versions.

:::tip
If you have changed a variable and your application still reads the old value, check that you
have deployed. The serve endpoints always answer from the **active deployment**, never from the
current draft configuration.
:::
