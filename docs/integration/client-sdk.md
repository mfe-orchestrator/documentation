---
sidebar_position: 2
title: The client SDK
sidebar_label: Client SDK
description: Resolve remote URLs at runtime with @mfe-orchestrator-hub/client, the framework-agnostic package the generated bundler configuration delegates to, plus its React, Vue and Angular adapters.
keywords: [client sdk, remoteUrl, configure, module federation, react, vue, angular]
---

# The client SDK

The generated bundler configuration no longer contains a URL. It contains a call into
`@mfe-orchestrator-hub/client`, which asks the serve API for the manifest at import time and hands
back a ready-to-use URL for each remote.

That indirection is the whole point: a URL baked into your host bundle would freeze one version into
it, and a [canary release](../microfrontends/canary-releases.md) could no longer decide which
version this particular browser should get. With the SDK in the middle, the decision stays on the
server and your host stays a single build.

## Packages

| Package | Repository | For |
| --- | --- | --- |
| `@mfe-orchestrator-hub/client` | [`client-core`](https://github.com/mfe-orchestrator/client-core) | Any application — framework agnostic, zero runtime dependencies |
| `@mfe-orchestrator-hub/client-react` | [`client-react`](https://github.com/mfe-orchestrator/client-react) | React ergonomics over the core |
| `@mfe-orchestrator-hub/client-vue` | [`client-vue`](https://github.com/mfe-orchestrator/client-vue) | Vue plugin and composables |
| `@mfe-orchestrator-hub/client-angular` | [`client-angular`](https://github.com/mfe-orchestrator/client-angular) | Angular provider and injectable service |

All four are published at `0.1.0` with npm provenance. The core ships ESM and CJS builds and its own
types; the three adapters depend on it and contain **no decision logic of their own**.

```bash
npm install @mfe-orchestrator-hub/client
```

Install it in the **host**. Remotes do not need it — they are loaded, they do not load anything.

## Configure once, at the top of the entry point

```ts
// src/main.ts
import { configure } from '@mfe-orchestrator-hub/client'

configure({
  backendUrl: import.meta.env.VITE_MFE_BACKEND_URL,
  projectId: import.meta.env.VITE_MFE_PROJECT_ID,
  environment: import.meta.env.VITE_MFE_ENVIRONMENT
})
```

`configure()` is synchronous, idempotent, and must run **before anything imports a remote** — the
remotes in your federation config call into the SDK the moment they are first imported, and a call
that arrives before `configure()` rejects with an explicit *call configure() first*.

The console emits this block, commented out, underneath the generated bundler configuration, because
it does not belong in the config file but in your entry point.

### Configuration

```ts
interface OrchestratorConfig {
  backendUrl: string   // ex. "https://console.mfe-orchestrator.dev/api"
  projectId: string
  environment: string  // environment slug, ex. "DEV"
  userId?: string | (() => string | undefined | Promise<string | undefined>)
}
```

`userId` is the only optional field, and the only one the SDK does not know how to work out for
itself. Pass it — as a value or as a getter, if the user is not known yet at bootstrap — when you
want [On User](../microfrontends/canary-releases.md#who--the-canary-type) canary targeting to work.

## The API

```ts
/** Call once, synchronously, before any remote is imported. Idempotent. */
function configure(config: OrchestratorConfig): void

/** The ready-to-use, version-pinned URL of a remote. Awaits the manifest internally. */
function remoteUrl(slug: string): Promise<string>

/** The whole manifest, fetched once and memoised. */
function manifest(): Promise<Manifest>

/** The environment's variables, as a plain object. */
function globalVariables(): Promise<Record<string, string>>

/** The two generated ids, exposed for telemetry and debugging. */
function identities(): { sessionId: string; deviceId: string }
```

`remoteUrl()` takes the microfrontend **slug**, not the federation remote name. Asking for a slug
that is not in the manifest rejects with a message listing the ones that are, which is usually
enough to spot the typo or the missing deployment.

:::caution Use the URL verbatim
`remoteUrl()` returns a URL that may already carry a `_v/<version>/` path segment, pinning the
version this browser is meant to receive. Never rebuild that URL by hand and never strip the
segment: the entry point resolves its chunks relative to the URL it was loaded from, and a
versionless URL can end up mixing two builds in one page. See
[how the version reaches the browser](../microfrontends/canary-releases.md#how-the-version-reaches-the-browser).
:::

## Identities

On first use the SDK generates two ids with `crypto.randomUUID()` and persists them:

| Id | Storage | Key | Lifetime |
| --- | --- | --- | --- |
| Session id | `sessionStorage` | `mfe-orchestrator.sessionId` | Dies with the browser session |
| Device id | `localStorage` | `mfe-orchestrator.deviceId` | Survives browser restarts |

Both, plus `userId` when you supplied one, are sent as query parameters on the manifest request:

```http
GET {backendUrl}/serve/all/{projectId}/{environment}
    ?mfeSessionId=<uuid>&mfeDeviceId=<uuid>&mfeUserId=<optional>
```

The SDK sends **everything it has** and never tries to guess which one the server will use — that
is what lets you change canary strategy in the console with no host-side change. Storage that throws
(private browsing, storage disabled) falls back to an in-memory id for the lifetime of the page;
nothing escapes the SDK as an exception.

Identities are the reason a canary decision is sticky. They travel in the query string rather than
in a cookie because module scripts are fetched with a fixed `same-origin` credentials mode, so no
cookie of the MFE Orchestrator domain would ever reach the server —
[the details are on the canary page](../microfrontends/canary-releases.md#who--the-canary-type).

## Bundler configuration

The generated `remotes` block references the SDK by **bare specifier**, so it is your own bundler
that resolves it against your `node_modules` and inlines it into your host bundle:

```js
// Vite — @originjs/vite-plugin-federation
remotes: {
  'catalog': {
    external: `import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))`,
    externalType: 'promise'
  }
}
```

```js
// Webpack — ModuleFederationPlugin
remotes: {
  'catalog': `promise import('@mfe-orchestrator-hub/client').then(m => m.remoteUrl('catalog'))`
}
```

The core is a module-level singleton, so the copy your federation config reaches and the copy your
application code reaches are the same instance, sharing one configuration and one manifest fetch.

Full walkthroughs: [Vite](./module-federation-vite.md) and [Webpack](./module-federation-webpack.md).

## Framework adapters

Ergonomics only. If you need behaviour they do not have, it belongs in the core.

```tsx
// React
import { OrchestratorProvider, useRemoteUrl, useGlobalVariables, useManifest } from '@mfe-orchestrator-hub/client-react'

<OrchestratorProvider config={{ backendUrl, projectId, environment }}>
  <App />
</OrchestratorProvider>
```

```ts
// Vue
import { createOrchestrator } from '@mfe-orchestrator-hub/client-vue'

app.use(createOrchestrator({ backendUrl, projectId, environment }))
// then, in a component: useRemoteUrl(slug), useGlobalVariables()
```

```ts
// Angular
import { provideOrchestrator, OrchestratorService } from '@mfe-orchestrator-hub/client-angular'

bootstrapApplication(AppComponent, {
  providers: [provideOrchestrator({ backendUrl, projectId, environment })]
})
```

## What it deliberately does not do

- **One manifest request per page load**, memoised as a promise so concurrent callers share it.
- **No retries.** A network error surfaces as it is. The memo is cleared on failure, so the next
  call tries again — but nothing retries on your behalf, and remotes whose URL never resolved will
  not load on that page.
- **No caching beyond the page**, no service worker, no offline mode.
- **No cookies**, read or written.
- **No decision of its own.** It never parses the version out of a URL, never draws a random number
  and does not know whether a canary exists.

## Without the SDK

You can still call [`/serve/all/...`](./serve-api.md#everything-about-an-environment) yourself and
register remotes by hand. If you do, you own the parts the SDK was written for: generating and
persisting the two ids, sending them on every manifest call, and passing the returned `url` through
untouched.
