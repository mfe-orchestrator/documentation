---
sidebar_position: 4
title: Read runtime configuration in the browser
sidebar_label: Runtime configuration
---

# Read runtime configuration in the browser

This page shows how to read an environment's [environment variables](../environments/environment-variables.md)
from the browser, so a single build can be configured differently in each stage.

The console generates both snippets with your ids already substituted, under
**Integration → Environment variables**.

## Option 1: the generated script

MFE Orchestrator can serve your variables as a JavaScript file that assigns them to
`window.globalConfig`. Add it to your `index.html` **before** your application bundle:

```html
<!doctype html>
<html>
  <head>
    <script src="<API_BASE>/serve/global-variables/<environmentId>/index.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

The served file looks like this:

```js
window.globalConfig = {
  "API_URL": "https://api.example.com",
  "ENABLE_NEW_CHECKOUT": "true"
}
```

Then read it anywhere in your code:

```js
const apiUrl = window.globalConfig?.API_URL
const featureFlag = window.globalConfig?.ENABLE_NEW_CHECKOUT === 'true'

if (featureFlag) {
  fetch(apiUrl + '/checkout/v2')
}
```

Because the script is a blocking `<script>` in `<head>`, `window.globalConfig` is guaranteed to
exist by the time your bundle runs — no loading state, no race.

### Values are always strings

Everything comes back as a string, including `"true"`, `"false"` and `"0"`. Compare explicitly:

```js
// ✅
const enabled = window.globalConfig?.ENABLE_NEW_CHECKOUT === 'true'

// ❌ "false" is truthy
const enabled = Boolean(window.globalConfig?.ENABLE_NEW_CHECKOUT)
```

A small typed accessor is worth writing once:

```ts
// config.ts
declare global {
  interface Window {
    globalConfig?: Record<string, string>
  }
}

const raw = window.globalConfig ?? {}

export const config = {
  apiUrl: raw.API_URL ?? 'http://localhost:8080',
  newCheckout: raw.ENABLE_NEW_CHECKOUT === 'true',
}
```

The fallbacks keep local development working without a `<script>` tag pointing at a deployed
environment.

## Option 2: fetch the JSON

If you would rather control loading yourself:

```js
const vars = await fetch('<API_BASE>/serve/global-variables/<environmentId>')
  .then(r => r.json())
// [{ key: 'API_URL', value: 'https://api.example.com' }, …]
```

This form returns an array of `{ key, value }` objects. Convert it if you want a lookup:

```js
const config = Object.fromEntries(vars.map(v => [v.key, v.value]))
```

The trade-off is that your application now has an asynchronous startup dependency: everything that
reads configuration must wait for the fetch. Option 1 avoids that entirely, which is why it is the
default recommendation.

## Addressing an environment without its id

Both forms also accept a project id and environment slug, which are more readable and stable than
an object id:

```
<API_BASE>/serve/global-variables/<projectId>/<environmentSlug>
```

Unlike the microfrontend file endpoints, the variables endpoints do **not** resolve the
environment from the request domain, so one of the two addressing forms is always required. If you
want a single `index.html` across environments, inject the environment id or slug at deploy time,
or read the variables through `/serve/all/<projectId>/<environmentSlug>`.

## Where the values come from

Always from the **active deployment** of that environment — never from the draft configuration in
the console. A variable you have added but not deployed is not served. This is the same rule that
governs microfrontend versions, and it means a configuration rollback is just a
[redeploy](../deployments/rollback-and-redeploy.md).

## Security

:::caution Public endpoint
`/serve/global-variables/...` is unauthenticated. Anyone with your project and environment id can
read every variable in it. Put only public configuration here — API base URLs, feature flags,
tracking ids, public keys. Never secrets.
:::

If you need secrets in the browser, you do not: move the operation that needs them behind your own
backend.
